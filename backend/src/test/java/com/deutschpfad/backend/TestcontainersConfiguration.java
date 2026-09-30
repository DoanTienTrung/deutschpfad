package com.deutschpfad.backend;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import java.util.List;

/**
 * Hạ tầng dùng chung cho mọi test cần khởi động toàn bộ Spring context.
 *
 * <p>Dùng kèm {@code @Import(TestcontainersConfiguration.class)} và {@code @ActiveProfiles("test")}.
 *
 * <p><b>Vì sao các test {@code @SpringBootTest} từng đỏ:</b> không phải một mà bốn nguyên nhân xếp
 * chồng, mỗi lần chỉ lộ ra cái đầu tiên:
 * <ol>
 *   <li>{@code BackendApplicationTests} không dùng Testcontainers nên kết nối vào
 *       {@code localhost:5433} theo mặc định của application.yaml — trên máy dev đó lại là
 *       Postgres của một dự án khác, sai mật khẩu. Trên CI thì không có DB nào cả.</li>
 *   <li>Thiếu biến môi trường bắt buộc ({@code JWT_SECRET}, {@code GOOGLE_CLIENT_ID},
 *       {@code GOOGLE_CLIENT_SECRET}) — xem {@code application-test.yaml}.</li>
 *   <li>Image {@code postgres:16} không có extension pgvector, mà migration V42 chạy
 *       {@code CREATE EXTENSION vector} → Flyway chết.</li>
 *   <li>Bean {@code EmbeddingModel} chỉ được khai báo cho profile {@code local} (ONNX, cần file
 *       model không có trong repo) và {@code prod} (Cohere, cần API key) — profile test không có.</li>
 * </ol>
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    // Phải khớp số chiều của bảng tutor_knowledge_chunk (TutorConfig: .dimension(1024)).
    private static final int EMBEDDING_DIMENSION = 1024;

    /**
     * Postgres thật chạy trong Docker. Dùng image pgvector thay vì {@code postgres:16} thuần vì
     * migration V42 cần extension {@code vector}.
     *
     * <p>{@code @ServiceConnection} tự nối datasource vào container — không cần
     * {@code @DynamicPropertySource} như cách cũ.
     */
    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>(
            DockerImageName.parse("pgvector/pgvector:pg16").asCompatibleSubstituteFor("postgres")
        );
    }

    /**
     * Thay cho ONNX (local) / Cohere (prod). Test không đụng tới tính năng gia sư RAG, nên chỉ cần
     * thứ gì đó thoả interface và không gọi mạng. Trả vector toàn số 0 đúng số chiều — nếu có test
     * nào vô tình đi qua đường tìm kiếm thì nhận kết quả vô nghĩa chứ không nổ NullPointerException.
     */
    @Bean("documentEmbeddingModel")
    EmbeddingModel documentEmbeddingModel() {
        return zeroEmbeddingModel();
    }

    @Bean("queryEmbeddingModel")
    EmbeddingModel queryEmbeddingModel() {
        return zeroEmbeddingModel();
    }

    private static EmbeddingModel zeroEmbeddingModel() {
        return new EmbeddingModel() {
            @Override
            public Response<List<Embedding>> embedAll(List<TextSegment> segments) {
                List<Embedding> zeros = segments.stream()
                    .map(s -> new Embedding(new float[EMBEDDING_DIMENSION]))
                    .toList();
                return Response.from(zeros);
            }

            @Override
            public int dimension() {
                return EMBEDDING_DIMENSION;
            }
        };
    }
}
