package com.deutschpfad.backend.speaking;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

public record SpeakingPromptResponse(
    Long id, VocabularyItem.Level level, String promptText, String description, int orderIndex
) {
    public static SpeakingPromptResponse from(SpeakingPrompt prompt) {
        return new SpeakingPromptResponse(
            prompt.getId(),
            prompt.getLevel(),
            prompt.getPromptText(),
            prompt.getDescription(),
            prompt.getOrderIndex()
        );
    }
}
