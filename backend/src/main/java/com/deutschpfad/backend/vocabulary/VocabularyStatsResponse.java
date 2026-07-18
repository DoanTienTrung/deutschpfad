package com.deutschpfad.backend.vocabulary;

public record VocabularyStatsResponse(
    long learned,
    long remembered,
    long dueForReview
) {}
