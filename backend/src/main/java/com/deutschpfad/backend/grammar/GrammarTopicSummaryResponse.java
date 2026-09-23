package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

public record GrammarTopicSummaryResponse(
    Long id,
    String slug,
    String titleDe,
    String titleVi,
    VocabularyItem.Level level,
    String groupLabel,
    int orderIndex,
    String summaryVi,
    int exerciseCount,
    boolean hasTheory,
    // Null khi người học chưa từng nộp bài ở chủ điểm này ("chưa học").
    UserGrammarProgress.Status status,
    int correctCount,
    int totalCount
) {
    public static GrammarTopicSummaryResponse from(
        GrammarTopic topic, int exerciseCount, UserGrammarProgress progress
    ) {
        return new GrammarTopicSummaryResponse(
            topic.getId(),
            topic.getSlug(),
            topic.getTitleDe(),
            topic.getTitleVi(),
            topic.getLevel(),
            topic.getGroupLabel(),
            topic.getOrderIndex(),
            topic.getSummaryVi(),
            exerciseCount,
            topic.getTheoryMd() != null && !topic.getTheoryMd().isBlank(),
            progress == null ? null : progress.getStatus(),
            progress == null ? 0 : progress.getCorrectCount(),
            progress == null ? 0 : progress.getTotalCount()
        );
    }
}
