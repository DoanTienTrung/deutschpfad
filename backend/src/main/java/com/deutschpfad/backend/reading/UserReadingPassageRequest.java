package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserReadingPassageRequest(
    @NotBlank String title,
    @NotNull VocabularyItem.Level levelMin,
    @NotNull VocabularyItem.Level levelMax,
    @NotBlank String content,
    String sourceUrl
) {
}
