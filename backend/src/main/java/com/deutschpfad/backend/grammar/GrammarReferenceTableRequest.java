package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GrammarReferenceTableRequest(
    @NotBlank String slug,
    @NotBlank String titleVi,
    @NotBlank String category,
    VocabularyItem.Level level,
    @NotNull Integer orderIndex,
    @NotBlank String contentMd
) {
}
