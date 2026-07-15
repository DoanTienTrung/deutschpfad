package com.deutschpfad.backend.vocabulary;

public record LessonSummaryResponse(
    Long id,
    String title,
    VocabularyItem.Level level,
    VocabularyItem.Source source,
    int orderIndex,
    String description,
    int wordCount,
    Long topicId,
    String topicName
) {
    public static LessonSummaryResponse from(Lesson lesson, int wordCount) {
        return new LessonSummaryResponse(
            lesson.getId(),
            lesson.getTitle(),
            lesson.getLevel(),
            lesson.getSource(),
            lesson.getOrderIndex(),
            lesson.getDescription(),
            wordCount,
            lesson.getTopic() != null ? lesson.getTopic().getId() : null,
            lesson.getTopic() != null ? lesson.getTopic().getName() : null
        );
    }
}
