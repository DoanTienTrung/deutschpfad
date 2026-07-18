package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ListeningExerciseRequest(
    @NotBlank String title,
    @NotNull VocabularyItem.Level levelMin,
    @NotNull VocabularyItem.Level levelMax,
    String youtubeVideoId,
    String audioUrl,
    String sourceLabel,
    String sourceUrl,
    String description,
    String topic,
    @NotNull Integer orderIndex,
    String rawTranscript,
    boolean autoFetch
) {
}
