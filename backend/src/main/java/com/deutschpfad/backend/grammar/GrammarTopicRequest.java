package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GrammarTopicRequest(
    @NotBlank String slug,
    @NotBlank String titleDe,
    @NotBlank String titleVi,
    @NotNull VocabularyItem.Level level,
    String groupLabel,
    @NotNull Integer orderIndex,
    String summaryVi,
    String theoryMd
) {
}
