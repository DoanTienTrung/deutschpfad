package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

public record GrammarReferenceTableResponse(
    Long id,
    String slug,
    String titleVi,
    String category,
    VocabularyItem.Level level,
    int orderIndex,
    String contentMd
) {
    public static GrammarReferenceTableResponse from(GrammarReferenceTable table) {
        return new GrammarReferenceTableResponse(
            table.getId(),
            table.getSlug(),
            table.getTitleVi(),
            table.getCategory(),
            table.getLevel(),
            table.getOrderIndex(),
            table.getContentMd()
        );
    }
}
