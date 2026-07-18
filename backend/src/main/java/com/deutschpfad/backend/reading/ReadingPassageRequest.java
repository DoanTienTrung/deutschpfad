package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReadingPassageRequest(
    @NotBlank String title,
    @NotNull VocabularyItem.Level levelMin,
    @NotNull VocabularyItem.Level levelMax,
    String topic,
    String sourceLabel,
    String sourceUrl,
    @NotNull Integer orderIndex,
    @NotBlank String content,
    @NotNull ReadingPassage.Category category,
    @Valid List<ReadingQuestionInput> questions,
    @Valid List<ReadingMatchingOptionInput> matchingOptions
) {
}
