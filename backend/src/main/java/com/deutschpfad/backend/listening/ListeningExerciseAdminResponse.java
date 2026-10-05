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
    Integer durationSeconds,
    ListeningExercise.Kind kind,
    ListeningExercise.Status status,
    String importError,
    Long channelId,
    String channelName,
    int sentenceCount,
    boolean autoFetched,
    List<ListeningSentenceResponse> sentences
) {
    public static ListeningExerciseAdminResponse from(
        ListeningExercise exercise, List<ListeningSentence> sentences, boolean autoFetched
    ) {
        return build(exercise, sentences.size(), autoFetched, sentences.stream().map(ListeningSentenceResponse::from).toList());
    }

    /** Dòng trong danh sách admin: chỉ số câu, không kèm câu (150 video × vài trăm câu là quá nặng). */
    public static ListeningExerciseAdminResponse summary(ListeningExercise exercise, int sentenceCount) {
        return build(exercise, sentenceCount, false, List.of());
    }

    private static ListeningExerciseAdminResponse build(
        ListeningExercise exercise, int sentenceCount, boolean autoFetched, List<ListeningSentenceResponse> sentences
    ) {
        ListeningChannel channel = exercise.getChannel();
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
            exercise.getDurationSeconds(),
            exercise.getKind(),
            exercise.getStatus(),
            exercise.getImportError(),
            channel != null ? channel.getId() : null,
            channel != null ? channel.getName() : null,
            sentenceCount,
            autoFetched,
            sentences
        );
    }
}
