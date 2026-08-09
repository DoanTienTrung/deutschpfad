package com.deutschpfad.backend.tutor;

import dev.langchain4j.rag.content.Content;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.query.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Bọc ContentRetriever thật, tự bắt exception (vd Cohere lỗi/hết quota) thay vì để lỗi phá vỡ cả
 * câu trả lời — RAG là phần bổ sung, không nên làm cả chatbot ngừng hoạt động khi riêng phần tìm
 * ngữ cảnh gặp sự cố. LangChain4j không tự bắt lỗi này (xác nhận qua source
 * DefaultRetrievalAugmentor — không có try/catch quanh contentRetriever.retrieve(...)).
 */
class SafeContentRetriever implements ContentRetriever {

    private static final Logger log = LoggerFactory.getLogger(SafeContentRetriever.class);

    private final ContentRetriever delegate;

    SafeContentRetriever(ContentRetriever delegate) {
        this.delegate = delegate;
    }

    @Override
    public List<Content> retrieve(Query query) {
        try {
            return delegate.retrieve(query);
        } catch (RuntimeException e) {
            log.warn("ContentRetriever lỗi, bỏ qua RAG context cho câu hỏi này: {}", e.getMessage());
            return List.of();
        }
    }
}
