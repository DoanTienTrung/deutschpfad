package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

public record ListeningExerciseSummaryResponse(
    Long id,
    String title,
    VocabularyItem.Level levelMin,
    VocabularyItem.Level levelMax,
    String youtubeVideoId,
    String sourceLabel,
    String description,
    String topic,
    int orderIndex,
    int sentenceCount,
    Integer durationSeconds
) {
    public static ListeningExerciseSummaryResponse from(ListeningExercise exercise, int sentenceCount) {
        return new ListeningExerciseSummaryResponse(
            exercise.getId(),
            exercise.getTitle(),
            exercise.getLevelMin(),
            exercise.getLevelMax(),
            exercise.getYoutubeVideoId(),
            exercise.getSourceLabel(),
            exercise.getDescription(),
            exercise.getTopic(),
            exercise.getOrderIndex(),
            sentenceCount,
            exercise.getDurationSeconds()
        );
    }
}
