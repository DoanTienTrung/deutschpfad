package com.deutschpfad.backend.vocabulary;

public record VocabAuditInput(
    String germanWord, String wordType, String vietnameseMeaning, String englishMeaning,
    String phonetic, String exampleSentence
) {}
