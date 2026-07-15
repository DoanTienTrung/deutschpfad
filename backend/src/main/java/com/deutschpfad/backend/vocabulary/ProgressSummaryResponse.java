package com.deutschpfad.backend.vocabulary;

public record ProgressSummaryResponse(
    VocabularyItem.Source source,
    VocabularyItem.Level level,
    long completedLessons,
    long totalLessons
) {
}
