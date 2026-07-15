package com.deutschpfad.backend.vocabulary;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VocabularyItemRequest(
    @NotBlank String germanWord,
    @NotBlank String vietnameseMeaning,
    String englishMeaning,
    String phonetic,
    String wordType,
    String exampleSentence,
    String imageUrl,
    @NotNull VocabularyItem.Level level,
    VocabularyItem.Source source,
    Long topicId,
    Long lessonId
) {
}
