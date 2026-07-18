package com.deutschpfad.backend.vocabulary;

public record VocabLookupResult(
    String germanWord,
    String wordType,
    String vietnameseMeaning,
    String englishMeaning,
    String phonetic,
    String exampleSentence,
    String synonyms,
    String antonyms
) {}
