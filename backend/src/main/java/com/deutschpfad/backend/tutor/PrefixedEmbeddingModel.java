package com.deutschpfad.backend.tutor;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Bọc 1 EmbeddingModel để tự thêm tiền tố "query: "/"passage: " bắt buộc của họ model E5
 * (intfloat/multilingual-e5-large) trước khi embed — thiếu tiền tố này làm giảm rõ rệt độ
 * phân biệt của cosine similarity (đã kiểm chứng thực tế: thiếu tiền tố, 3 câu khác chủ đề
 * cho similarity dồn sát nhau 0.896-0.906 và chọn sai câu; xem docs/phase-10-tutor-chatbot-kien-thuc.md).
 * Chỉ dùng cho @Profile("local") (Onnx) — Cohere xử lý bất đối xứng qua tham số inputType
 * riêng lúc gọi API, không cần tiền tố trong text.
 */
class PrefixedEmbeddingModel implements EmbeddingModel {

    private final EmbeddingModel delegate;
    private final String prefix;

    PrefixedEmbeddingModel(EmbeddingModel delegate, String prefix) {
        this.delegate = delegate;
        this.prefix = prefix;
    }

    @Override
    public Response<List<Embedding>> embedAll(List<TextSegment> textSegments) {
        List<TextSegment> prefixed = textSegments.stream()
                .map(segment -> TextSegment.from(prefix + segment.text(), segment.metadata()))
                .collect(Collectors.toList());
        return delegate.embedAll(prefixed);
    }
}
