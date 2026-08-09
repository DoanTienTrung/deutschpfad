package com.deutschpfad.backend.tutor;

import dev.langchain4j.model.cohere.CohereEmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.OnnxEmbeddingModel;
import dev.langchain4j.model.embedding.onnx.PoolingMode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.DefaultMetadataStorageConfig;
import dev.langchain4j.store.embedding.pgvector.MetadataStorageMode;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import javax.sql.DataSource;
import java.util.List;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;



@Configuration
public class TutorConfig {

    @Bean
    @Profile("local")
    public OnnxEmbeddingModel onnxEmbeddingModel(
            @Value("${app.tutor.onnx-model-path}") String modelPath,
            @Value("${app.tutor.onnx-tokenizer-path}") String tokenizerPath) {
        return new OnnxEmbeddingModel(modelPath, tokenizerPath, PoolingMode.MEAN);
    }


    // ===== @Profile("local") — self-host ONNX, 1 instance dùng chung cho document + query =====
    // (Onnx không có ràng buộc bất đối xứng search_document/search_query như Cohere, nên không
    // cần 2 instance riêng — chỉ Cohere mới cần, xem khối @Profile("prod") bên dưới)

    @Bean("documentEmbeddingModel")
    @Profile("local")
    public EmbeddingModel onnxDocumentEmbeddingModel(OnnxEmbeddingModel onnxEmbeddingModel) {
        return new PrefixedEmbeddingModel(onnxEmbeddingModel, "passage: ");
    }

    @Bean("queryEmbeddingModel")
    @Profile("local")
    public EmbeddingModel onnxQueryEmbeddingModel(OnnxEmbeddingModel onnxEmbeddingModel) {
        return new PrefixedEmbeddingModel(onnxEmbeddingModel, "query: ");
    }

    // ===== @Profile("prod") — Cohere, 2 instance riêng theo inputType (bắt buộc với Cohere) =====

    @Bean("documentEmbeddingModel")
    @Profile("prod")
    public EmbeddingModel cohereDocumentEmbeddingModel(@Value("${app.cohere-api-key:}") String cohereApiKey) {
        return CohereEmbeddingModel.builder()
                .apiKey(cohereApiKey)
                .modelName("embed-multilingual-v3.0")
                .inputType("search_document")
                .build();
    }

    @Bean("queryEmbeddingModel")
    @Profile("prod")
    public EmbeddingModel cohereQueryEmbeddingModel(@Value("${app.cohere-api-key:}") String cohereApiKey) {
        return CohereEmbeddingModel.builder()
                .apiKey(cohereApiKey)
                .modelName("embed-multilingual-v3.0")
                .inputType("search_query")
                .build();
    }

    // ===== EmbeddingStore — dùng chung cho cả local/prod, không phụ thuộc @Profile =====
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore(DataSource dataSource) {
        return PgVectorEmbeddingStore.datasourceBuilder()
                .datasource(dataSource)
                .table("tutor_knowledge_chunk")
                .dimension(1024)
                .createTable(false)
                .metadataStorageConfig(DefaultMetadataStorageConfig.builder()
                        .storageMode(MetadataStorageMode.COMBINED_JSONB)
                        .columnDefinitions(List.of("metadata JSONB NULL"))
                        .build())
                .build();
    }
    // ===== 3 tầng ChatModel riêng cho tutor — không đụng GroqAiService/GeminiAiService/
    // OpenRouterAiService cũ (3 service đó giữ nguyên, phục vụ tính năng khác) =====

    @Bean("groqChatModel")
    public ChatModel groqChatModel(
            @Value("${app.groq-api-key:}") String groqApiKey,
            @Value("${app.tutor.temperature}") Double temperature,
            @Value("${app.tutor.max-output-tokens}") Integer maxOutputTokens) {
        return OpenAiChatModel.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .apiKey(groqApiKey)
                .modelName("openai/gpt-oss-120b")
                .temperature(temperature)
                .maxTokens(maxOutputTokens)
                .build();
    }


    @Bean("geminiChatModel")
    public ChatModel geminiChatModel(
            @Value("${app.gemini-api-key:}") String geminiApiKey,
            @Value("${app.tutor.temperature}") Double temperature,
            @Value("${app.tutor.max-output-tokens}") Integer maxOutputTokens) {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName("gemini-2.5-flash-lite")
                .temperature(temperature)
                .maxOutputTokens(maxOutputTokens)
                .build();
    }


    @Bean("openRouterChatModel")
    public ChatModel openRouterChatModel(
            @Value("${app.openrouter-api-key:}") String openRouterApiKey,
            @Value("${app.tutor.temperature}") Double temperature,
            @Value("${app.tutor.max-output-tokens}") Integer maxOutputTokens) {
        return OpenAiChatModel.builder()
                .baseUrl("https://openrouter.ai/api/v1")
                .apiKey(openRouterApiKey)
                .modelName("openrouter/free")
                .temperature(temperature)
                .maxTokens(maxOutputTokens)
                .build();
    }



    // Ghép 3 tầng lại — thứ tự ưu tiên: Groq trước (rẻ/nhanh), Gemini dự phòng, OpenRouter cuối
    // cùng. @Primary để chỗ nào tiêm ChatModel không chỉ định rõ tên sẽ tự lấy đúng bean này.
    @Bean
    @Primary
    public ChatModel fallbackChatModel(
            @Qualifier("groqChatModel") ChatModel groqChatModel,
            @Qualifier("geminiChatModel") ChatModel geminiChatModel,
            @Qualifier("openRouterChatModel") ChatModel openRouterChatModel) {
        return new FallbackChatModel(List.of(groqChatModel, geminiChatModel, openRouterChatModel));
    }

    // Dùng đúng bean queryEmbeddingModel (không phải documentEmbeddingModel) — đang mô phỏng
    // phía hỏi, không phải phía nạp dữ liệu. Xem lý do bất đối xứng ở khối bean Cohere phía trên.
    @Bean
    public ContentRetriever contentRetriever(
            EmbeddingStore<TextSegment> embeddingStore,
            @Qualifier("queryEmbeddingModel") EmbeddingModel queryEmbeddingModel,
            @Value("${app.tutor.rag-max-results}") Integer maxResults,
            @Value("${app.tutor.rag-min-score}") Double minScore) {
        ContentRetriever delegate = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(queryEmbeddingModel)
                .maxResults(maxResults)
                .minScore(minScore)
                .build();
        return new SafeContentRetriever(delegate);
    }


}
