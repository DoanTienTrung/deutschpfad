package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

import java.util.List;

public record ListeningExerciseAdminResponse(
    Long id,
    String title,
    VocabularyItem.Level levelMin,
    VocabularyItem.Level levelMax,
    String youtubeVideoId,
    String audioUrl,
    String sourceLabel,
    String sourceUrl,
    String description,
    String topic,
    int orderIndex,
    boolean autoFetched,
    List<ListeningSentenceResponse> sentences
) {
    public static ListeningExerciseAdminResponse from(
        ListeningExercise exercise, List<ListeningSentence> sentences, boolean autoFetched
    ) {
        return new ListeningExerciseAdminResponse(
            exercise.getId(),
            exercise.getTitle(),
            exercise.getLevelMin(),
            exercise.getLevelMax(),
            exercise.getYoutubeVideoId(),
            exercise.getAudioUrl(),
            exercise.getSourceLabel(),
            exercise.getSourceUrl(),
            exercise.getDescription(),
            exercise.getTopic(),
            exercise.getOrderIndex(),
            autoFetched,
            sentences.stream().map(ListeningSentenceResponse::from).toList()
        );
    }
}
