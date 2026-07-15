package com.deutschpfad.backend.speaking;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SpeakingPromptRequest(
    @NotNull VocabularyItem.Level level,
    @NotBlank String promptText,
    String description,
    @NotNull Integer orderIndex
) {
}
