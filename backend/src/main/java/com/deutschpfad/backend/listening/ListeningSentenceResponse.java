package com.deutschpfad.backend.listening;

public record ListeningSentenceResponse(
    Long id, int orderIndex, String text, int startSeconds, int endSeconds, String translation, String phonetic
) {
    public static ListeningSentenceResponse from(ListeningSentence sentence) {
        return new ListeningSentenceResponse(
            sentence.getId(),
            sentence.getOrderIndex(),
            sentence.getText(),
            sentence.getStartSeconds(),
            sentence.getEndSeconds(),
            sentence.getTranslation(),
            sentence.getPhonetic()
        );
    }
}
