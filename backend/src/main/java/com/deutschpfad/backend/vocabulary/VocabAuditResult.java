package com.deutschpfad.backend.vocabulary;

public record VocabAuditResult(
    String vietnameseMeaning, String englishMeaning, String phonetic, String exampleSentence, String highlightWord
) {
    public static VocabAuditResult unchanged(VocabAuditInput input) {
        return new VocabAuditResult(
            input.vietnameseMeaning(), input.englishMeaning(), input.phonetic(), input.exampleSentence(), null
        );
    }
}
