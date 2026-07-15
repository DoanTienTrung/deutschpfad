package com.deutschpfad.backend.listening;

public record UserListeningSentenceResponse(
    Long id, int orderIndex, String text, int startSeconds, int endSeconds, String translation, String phonetic
) {
    public static UserListeningSentenceResponse from(UserListeningSentence sentence) {
        return new UserListeningSentenceResponse(
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
