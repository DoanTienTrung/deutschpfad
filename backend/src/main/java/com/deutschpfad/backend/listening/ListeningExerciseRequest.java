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
    boolean autoFetch,
    // null = không có kênh
    Long channelId,
    // null = tự suy: có audioUrl là EXAM, còn lại giữ nguyên (bài mới: YOUTUBE)
    ListeningExercise.Kind kind,
    // null = giữ nguyên; chỉ áp dụng khi bài đang READY hoặc HIDDEN
    Boolean hidden
) {
}
