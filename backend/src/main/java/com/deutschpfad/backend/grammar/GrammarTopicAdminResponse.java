package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

import java.util.List;

public record GrammarTopicAdminResponse(
    Long id,
    String slug,
    String titleDe,
    String titleVi,
    VocabularyItem.Level level,
    String groupLabel,
    int orderIndex,
    String summaryVi,
    String theoryMd,
    List<GrammarExerciseAdminResponse> exercises
) {
    public static GrammarTopicAdminResponse from(GrammarTopic topic, List<GrammarExercise> exercises) {
        return new GrammarTopicAdminResponse(
            topic.getId(),
            topic.getSlug(),
            topic.getTitleDe(),
            topic.getTitleVi(),
            topic.getLevel(),
            topic.getGroupLabel(),
            topic.getOrderIndex(),
            topic.getSummaryVi(),
            topic.getTheoryMd(),
            exercises.stream().map(GrammarExerciseAdminResponse::from).toList()
        );
    }
}
