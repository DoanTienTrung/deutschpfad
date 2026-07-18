package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

import java.util.List;

public record ListeningExerciseDetailResponse(
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
    List<ListeningSentenceResponse> sentences
) {
    public static ListeningExerciseDetailResponse from(ListeningExercise exercise, List<ListeningSentence> sentences) {
        return new ListeningExerciseDetailResponse(
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
            sentences.stream().map(ListeningSentenceResponse::from).toList()
        );
    }
}
