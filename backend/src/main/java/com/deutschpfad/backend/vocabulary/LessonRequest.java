package com.deutschpfad.backend.vocabulary;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LessonRequest(
    @NotBlank String title,
    @NotNull VocabularyItem.Level level,
    VocabularyItem.Source source,
    @NotNull Integer orderIndex,
    String description,
    Long topicId
) {
}
