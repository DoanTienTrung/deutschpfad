package com.deutschpfad.backend.vocabulary;

public record DeckItemResponse(
    Long id,
    String germanWord,
    String vietnameseMeaning,
    String wordType,
    String exampleSentence
) {
    public static DeckItemResponse from(UserDeckItem item) {
        return new DeckItemResponse(
            item.getId(),
            item.getGermanWord(),
            item.getVietnameseMeaning(),
            item.getWordType(),
            item.getExampleSentence()
        );
    }
}
