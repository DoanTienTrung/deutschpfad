package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

import java.util.List;

public record GrammarTopicDetailResponse(
    Long id,
    String slug,
    String titleDe,
    String titleVi,
    VocabularyItem.Level level,
    String groupLabel,
    String summaryVi,
    String theoryMd,
    String referenceSlug,
    List<GrammarExercisePracticeResponse> exercises
) {
    public static GrammarTopicDetailResponse from(GrammarTopic topic, List<GrammarExercise> exercises) {
        return new GrammarTopicDetailResponse(
            topic.getId(),
            topic.getSlug(),
            topic.getTitleDe(),
            topic.getTitleVi(),
            topic.getLevel(),
            topic.getGroupLabel(),
            topic.getSummaryVi(),
            topic.getTheoryMd(),
            topic.getReferenceSlug(),
            exercises.stream().map(GrammarExercisePracticeResponse::from).toList()
        );
    }
}
