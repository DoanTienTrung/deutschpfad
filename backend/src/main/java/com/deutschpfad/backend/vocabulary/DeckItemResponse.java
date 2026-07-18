package com.deutschpfad.backend.vocabulary;

public record DeckItemResponse(
    Long id,
    String germanWord,
    String vietnameseMeaning,
    String wordType,
    String exampleSentence,
    String phonetic,
    String englishMeaning,
    String synonyms,
    String antonyms
) {
    public static DeckItemResponse from(UserDeckItem item) {
        return new DeckItemResponse(
            item.getId(),
            item.getGermanWord(),
            item.getVietnameseMeaning(),
            item.getWordType(),
            item.getExampleSentence(),
            item.getPhonetic(),
            item.getEnglishMeaning(),
            item.getSynonyms(),
            item.getAntonyms()
        );
    }
}
