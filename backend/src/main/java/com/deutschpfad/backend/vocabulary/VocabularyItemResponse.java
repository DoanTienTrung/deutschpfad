package com.deutschpfad.backend.vocabulary;

public record VocabularyItemResponse(
    Long id,
    String germanWord,
    String vietnameseMeaning,
    String englishMeaning,
    String phonetic,
    String wordType,
    String exampleSentence,
    String imageUrl,
    VocabularyItem.Level level,
    VocabularyItem.Source source,
    Long topicId,
    String topicName,
    Long lessonId,
    String lessonTitle
) {
    public static VocabularyItemResponse from(VocabularyItem v) {
        return new VocabularyItemResponse(
            v.getId(),
            v.getGermanWord(),
            v.getVietnameseMeaning(),
            v.getEnglishMeaning(),
            v.getPhonetic(),
            v.getWordType(),
            v.getExampleSentence(),
            v.getImageUrl(),
            v.getLevel(),
            v.getSource(),
            v.getTopic() != null ? v.getTopic().getId() : null,
            v.getTopic() != null ? v.getTopic().getName() : null,
            v.getLesson() != null ? v.getLesson().getId() : null,
            v.getLesson() != null ? v.getLesson().getTitle() : null
        );
    }
}
