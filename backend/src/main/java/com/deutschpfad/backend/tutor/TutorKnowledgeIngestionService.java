package com.deutschpfad.backend.tutor;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import com.deutschpfad.backend.vocabulary.VocabularyItemRepository;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.document.parser.apache.tika.ApacheTikaDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static dev.langchain4j.store.embedding.filter.MetadataFilterBuilder.metadataKey;

@Service
public class TutorKnowledgeIngestionService {

    private static final int VOCAB_EMBED_BATCH_SIZE = 40;
    // Cohere Trial key giới hạn 100 call/phút. Với ~9700 từ vựng hiện có (243 lô), chạy liên tục
    // không nghỉ sẽ chạm trần ở khoảng lô thứ 100 và ném lỗi 429 giữa chừng. Giãn cách 700ms/lô
    // giữ nhịp ~85 call/phút — chừa margin cho traffic thật (câu hỏi user khác cũng gọi Cohere).
    private static final long VOCAB_EMBED_DELAY_MS = 700;

    private final EmbeddingModel documentEmbeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final VocabularyItemRepository vocabularyItemRepository;
    private final int chunkSize;
    private final int chunkOverlap;

    public TutorKnowledgeIngestionService(
            @Qualifier("documentEmbeddingModel") EmbeddingModel documentEmbeddingModel,
            EmbeddingStore<TextSegment> embeddingStore,
            VocabularyItemRepository vocabularyItemRepository,
            @Value("${app.tutor.chunk-size}") int chunkSize,
            @Value("${app.tutor.chunk-overlap}") int chunkOverlap) {
        this.documentEmbeddingModel = documentEmbeddingModel;
        this.embeddingStore = embeddingStore;
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
    }

    // Tách riêng để dễ đổi sang chuỗi splitter khác sau này (vd có nguồn markdown thật) mà
    // không phải sửa nhiều nơi — xem lý do đầy đủ ở docs/phase-9-tutor-chatbot.md.
    private DocumentSplitter buildSplitter() {
        return DocumentSplitters.recursive(chunkSize, chunkOverlap);
    }

    public TutorIngestResult ingestGrammarNote(String title, String rawText, String level, String topic) {
        Document document = Document.from(rawText, buildGrammarMetadata(title, level, topic));
        int chunksCreated = ingestDocument(document);
        return new TutorIngestResult(document.metadata().getString("batchId"), chunksCreated);
    }

    public TutorIngestResult ingestGrammarFile(MultipartFile file, String title, String level, String topic) {
        Document parsed;
        try {
            parsed = new ApacheTikaDocumentParser().parse(file.getInputStream());
        } catch (IOException | RuntimeException e) {
            throw new IllegalArgumentException("Không đọc được nội dung file — file có thể bị hỏng hoặc không đúng định dạng hỗ trợ");
        }
        String actualTitle = (title == null || title.isBlank()) ? file.getOriginalFilename() : title;
        Document document = Document.from(parsed.text(), buildGrammarMetadata(actualTitle, level, topic));
        int chunksCreated = ingestDocument(document);
        return new TutorIngestResult(document.metadata().getString("batchId"), chunksCreated);
    }

    private Metadata buildGrammarMetadata(String title, String level, String topic) {
        return new Metadata()
                .put("sourceType", "GRAMMAR_NOTE")
                .put("batchId", UUID.randomUUID().toString())
                .put("title", title == null ? "" : title)
                .put("level", level == null ? "" : level)
                .put("topic", topic == null ? "" : topic)
                .put("createdAt", Instant.now().toString());
    }

    private int ingestDocument(Document document) {
        List<TextSegment> segments = buildSplitter().split(document);
        List<Embedding> embeddings = documentEmbeddingModel.embedAll(segments).content();
        embeddingStore.addAll(embeddings, segments);
        return segments.size();
    }

    // Đồng bộ lại toàn bộ từ vựng — xoá sạch chunk VOCAB cũ rồi nạp lại từ đầu (upsert an toàn
    // khi chạy nhiều lần, tự dọn luôn các từ đã bị xoá khỏi vocabulary_items).
    public int syncVocabulary() {
        embeddingStore.removeAll(metadataKey("sourceType").isEqualTo("VOCAB"));

        List<VocabularyItem> items = vocabularyItemRepository.findAll();
        List<List<VocabularyItem>> batches = partition(items, VOCAB_EMBED_BATCH_SIZE);
        int total = 0;
        for (int i = 0; i < batches.size(); i++) {
            List<TextSegment> segments = batches.get(i).stream().map(this::toVocabSegment).toList();
            List<Embedding> embeddings = documentEmbeddingModel.embedAll(segments).content();
            embeddingStore.addAll(embeddings, segments);
            total += segments.size();

            if (i < batches.size() - 1) {
                try {
                    Thread.sleep(VOCAB_EMBED_DELAY_MS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Đồng bộ từ vựng bị gián đoạn", e);
                }
            }
        }
        return total;
    }

    private TextSegment toVocabSegment(VocabularyItem item) {
        StringBuilder text = new StringBuilder(item.getGermanWord());
        if (item.getWordType() != null && !item.getWordType().isBlank()) {
            text.append(" (").append(item.getWordType()).append(")");
        }
        text.append(": ").append(item.getVietnameseMeaning());
        if (item.getExampleSentence() != null && !item.getExampleSentence().isBlank()) {
            text.append(". Ví dụ: ").append(item.getExampleSentence());
        }
        Metadata metadata = new Metadata()
                .put("sourceType", "VOCAB")
                .put("sourceId", String.valueOf(item.getId()));
        return TextSegment.from(text.toString(), metadata);
    }

    private static <T> List<List<T>> partition(List<T> list, int size) {
        List<List<T>> result = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            result.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return result;
    }
}
