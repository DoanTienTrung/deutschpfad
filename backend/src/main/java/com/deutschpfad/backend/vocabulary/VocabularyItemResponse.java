package com.deutschpfad.backend.vocabulary;

public record VocabularyItemResponse(
    Long id,
    String germanWord,
    String plural,
    String vietnameseMeaning,
    String englishMeaning,
    String phonetic,
    String wordType,
    String exampleSentence,
    String exampleSentenceVi,
    String exampleSentenceHighlight,
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
            v.getPlural(),
            v.getVietnameseMeaning(),
            v.getEnglishMeaning(),
            v.getPhonetic(),
            v.getWordType(),
            v.getExampleSentence(),
            v.getExampleSentenceVi(),
            v.getExampleSentenceHighlight(),
            v.getImageUrl(),
            v.getLevel(),
            v.getSource(),
            v.getTopic() != null ? v.getTopic().getId() : null,
            v.getTopic() != null ? v.getTopic().getName() : null,
            v.getLesson() != null ? v.getLesson().getId() : null,
            v.getLesson() != null ? v.getLesson().getTitle() : null
        );
    }

    /** Bản không có câu ví dụ — cho từ thuộc nguồn đang ẩn mà không có dòng thay thế. */
    public VocabularyItemResponse withoutExample() {
        return new VocabularyItemResponse(
            id, germanWord, plural, vietnameseMeaning, englishMeaning, phonetic, wordType,
            null, null, null, imageUrl, level, source, topicId, topicName, null, null
        );
    }
}
