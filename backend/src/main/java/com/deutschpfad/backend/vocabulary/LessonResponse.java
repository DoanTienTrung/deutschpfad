package com.deutschpfad.backend.vocabulary;

public record LessonResponse(
    Long id,
    String title,
    VocabularyItem.Level level,
    VocabularyItem.Source source,
    Integer orderIndex,
    String description,
    Long topicId,
    String topicName
) {
    public static LessonResponse from(Lesson lesson) {
        return new LessonResponse(
            lesson.getId(),
            lesson.getTitle(),
            lesson.getLevel(),
            lesson.getSource(),
            lesson.getOrderIndex(),
            lesson.getDescription(),
            lesson.getTopic() != null ? lesson.getTopic().getId() : null,
            lesson.getTopic() != null ? lesson.getTopic().getName() : null
        );
    }
}
