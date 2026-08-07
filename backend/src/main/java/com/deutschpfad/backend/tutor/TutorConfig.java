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

}
