package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.listening.GeminiAiService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/admin/vocabulary-items")
@PreAuthorize("hasRole('ADMIN')")
public class VocabularyItemAdminController {

    private static final Logger log = LoggerFactory.getLogger(VocabularyItemAdminController.class);
    private static final int AUDIT_BATCH_SIZE = 15;
    private static final long AUDIT_BATCH_DELAY_MS = 6500;

    private final VocabularyItemRepository vocabularyItemRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final GeminiAiService aiService;

    private volatile boolean auditRunning = false;
    private final AtomicInteger auditProcessed = new AtomicInteger(0);
    private final AtomicInteger auditTotal = new AtomicInteger(0);
    private final AtomicInteger auditRewrittenSentences = new AtomicInteger(0);
    private final AtomicInteger auditFixedMeanings = new AtomicInteger(0);

    public VocabularyItemAdminController(
        VocabularyItemRepository vocabularyItemRepository,
        TopicRepository topicRepository,
        LessonRepository lessonRepository,
        GeminiAiService aiService
    ) {
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.topicRepository = topicRepository;
        this.lessonRepository = lessonRepository;
        this.aiService = aiService;
    }

    @GetMapping
    public List<VocabularyItemResponse> list() {
        return vocabularyItemRepository.findAll().stream()
            .map(VocabularyItemResponse::from)
            .toList();
    }

    @PostMapping
    public ResponseEntity<VocabularyItemResponse> create(@Valid @RequestBody VocabularyItemRequest request) {
        VocabularyItem item = new VocabularyItem();
        applyRequest(item, request);
        return ResponseEntity.ok(VocabularyItemResponse.from(vocabularyItemRepository.save(item)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VocabularyItemResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody VocabularyItemRequest request
    ) {
        VocabularyItem item = vocabularyItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng"));
        applyRequest(item, request);
        return ResponseEntity.ok(VocabularyItemResponse.from(vocabularyItemRepository.save(item)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vocabularyItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/audit")
    public ResponseEntity<String> startAudit() {
        if (auditRunning) {
            return ResponseEntity.status(409).body("Đang có 1 lượt quét chạy rồi");
        }
        List<VocabularyItem> items = vocabularyItemRepository.findByExampleSentenceIsNotNullAndExampleSentenceHighlightIsNull();
        auditRunning = true;
        auditProcessed.set(0);
        auditTotal.set(items.size());
        auditRewrittenSentences.set(0);
        auditFixedMeanings.set(0);
        new Thread(() -> runAudit(items), "vocab-audit").start();
        return ResponseEntity.accepted().body("Đã bắt đầu quét " + items.size() + " từ vựng");
    }

    @GetMapping("/audit-status")
    public Map<String, Object> auditStatus() {
        return Map.of(
            "running", auditRunning,
            "processed", auditProcessed.get(),
            "total", auditTotal.get(),
            "rewrittenSentences", auditRewrittenSentences.get(),
            "fixedMeanings", auditFixedMeanings.get()
        );
    }

    private void runAudit(List<VocabularyItem> items) {
        try {
            for (int start = 0; start < items.size(); start += AUDIT_BATCH_SIZE) {
                List<VocabularyItem> batch = items.subList(start, Math.min(start + AUDIT_BATCH_SIZE, items.size()));
                List<VocabAuditInput> inputs = batch.stream()
                    .map(v -> new VocabAuditInput(
                        v.getGermanWord(), v.getWordType(), v.getVietnameseMeaning(), v.getEnglishMeaning(),
                        v.getPhonetic(), v.getExampleSentence()
                    ))
                    .toList();
                List<VocabAuditResult> results = aiService.auditVocabularyItems(inputs);

                for (int i = 0; i < batch.size(); i++) {
                    VocabularyItem item = batch.get(i);
                    VocabAuditResult r = results.get(i);

                    if (!Objects.equals(item.getVietnameseMeaning(), r.vietnameseMeaning())
                        || !Objects.equals(item.getEnglishMeaning(), r.englishMeaning())
                        || !Objects.equals(item.getPhonetic(), r.phonetic())) {
                        auditFixedMeanings.incrementAndGet();
                    }
                    if (!Objects.equals(item.getExampleSentence(), r.exampleSentence())) {
                        auditRewrittenSentences.incrementAndGet();
                    }

                    item.setVietnameseMeaning(r.vietnameseMeaning());
                    item.setEnglishMeaning(r.englishMeaning());
                    item.setPhonetic(r.phonetic());
                    item.setExampleSentence(r.exampleSentence());
                    // Never clobber a previously-saved highlight with null — a failed/rate-limited
                    // AI call falls back to VocabAuditResult.unchanged(), which always has a null
                    // highlightWord, and blindly writing that would erase a prior successful audit.
                    if (r.highlightWord() != null) {
                        item.setExampleSentenceHighlight(r.highlightWord());
                    }
                    vocabularyItemRepository.save(item);
                    auditProcessed.incrementAndGet();
                }

                log.info("Vocab audit progress: {}/{}", auditProcessed.get(), items.size());
                Thread.sleep(AUDIT_BATCH_DELAY_MS);
            }
        } catch (Exception e) {
            log.warn("Vocab audit batch job failed", e);
        } finally {
            auditRunning = false;
        }
    }

    private void applyRequest(VocabularyItem item, VocabularyItemRequest request) {
        item.setGermanWord(request.germanWord());
        item.setVietnameseMeaning(request.vietnameseMeaning());
        item.setEnglishMeaning(request.englishMeaning());
        item.setPhonetic(request.phonetic());
        item.setWordType(request.wordType());
        item.setExampleSentence(request.exampleSentence());
        item.setImageUrl(request.imageUrl());
        item.setLevel(request.level());
        item.setSource(request.source() != null ? request.source() : VocabularyItem.Source.FREQUENCY);
        item.setTopic(request.topicId() != null
            ? topicRepository.findById(request.topicId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy topic"))
            : null);
        item.setLesson(request.lessonId() != null
            ? lessonRepository.findById(request.lessonId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lesson"))
            : null);
    }
}
