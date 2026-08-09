package com.deutschpfad.backend.tutor;

import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.chat.request.ChatRequest;
import dev.langchain4j.model.chat.response.ChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

class FallbackChatModel implements ChatModel {

    private static final Logger log = LoggerFactory.getLogger(FallbackChatModel.class);

    private final List<ChatModel> tiers;

    FallbackChatModel(List<ChatModel> tiers) {
        this.tiers = tiers;
    }

    @Override
    public ChatResponse doChat(ChatRequest chatRequest) {
        RuntimeException lastError = null;
        for (int i = 0; i < tiers.size(); i++) {
            try {
                ChatResponse response = tiers.get(i).chat(chatRequest);
                log.info("TutorChatModel: tầng {} xử lý thành công", i);
                return response;
            } catch (RuntimeException e) {
                log.warn("TutorChatModel: tầng {} lỗi, thử tầng tiếp theo — {}", i, e.getMessage());
                lastError = e;
            }
        }
        throw lastError;
    }
}
