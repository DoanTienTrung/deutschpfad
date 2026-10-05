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
    Integer durationSeconds,
    ListeningExercise.Kind kind,
    Long channelId,
    String channelName
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
            exercise.getDurationSeconds(),
            exercise.getKind(),
            exercise.getChannel() != null ? exercise.getChannel().getId() : null,
            exercise.getChannel() != null ? exercise.getChannel().getName() : null
        );
    }
}
