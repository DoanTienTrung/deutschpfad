package com.deutschpfad.backend.vocabulary;

import java.time.LocalDate;

public record ReviewResultResponse(
    int repetitions,
    double easeFactor,
    int intervalDays,
    LocalDate nextReviewDate
) {}
