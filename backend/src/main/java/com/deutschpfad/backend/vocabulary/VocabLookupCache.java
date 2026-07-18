package com.deutschpfad.backend.vocabulary;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Caches AI dictionary lookups (used by both the "Từ vựng" click-to-save flow and the Reading
// click popup) globally by German word, so the same word is never re-sent to the AI twice across
// the whole app, regardless of which user or feature looked it up.
@Entity
@Table(name = "vocab_lookup_cache")
@Getter
@Setter
public class VocabLookupCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Lowercased lookup key so "Haus" and "haus" share one cache entry.
    @Column(nullable = false, unique = true)
    private String word;

    @Column(name = "german_word", nullable = false)
    private String germanWord;

    @Column(name = "word_type")
    private String wordType;

    @Column(name = "vietnamese_meaning", nullable = false, columnDefinition = "TEXT")
    private String vietnameseMeaning;

    @Column(name = "english_meaning", columnDefinition = "TEXT")
    private String englishMeaning;

    private String phonetic;

    @Column(name = "example_sentence", columnDefinition = "TEXT")
    private String exampleSentence;

    @Column(columnDefinition = "TEXT")
    private String synonyms;

    @Column(columnDefinition = "TEXT")
    private String antonyms;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public VocabLookupResult toResult() {
        return new VocabLookupResult(
            germanWord, wordType, vietnameseMeaning, englishMeaning, phonetic, exampleSentence, synonyms, antonyms
        );
    }

    public static VocabLookupCache from(String word, VocabLookupResult result) {
        VocabLookupCache entry = new VocabLookupCache();
        entry.setWord(word);
        entry.setGermanWord(result.germanWord());
        entry.setWordType(result.wordType());
        entry.setVietnameseMeaning(result.vietnameseMeaning());
        entry.setEnglishMeaning(result.englishMeaning());
        entry.setPhonetic(result.phonetic());
        entry.setExampleSentence(result.exampleSentence());
        entry.setSynonyms(result.synonyms());
        entry.setAntonyms(result.antonyms());
        return entry;
    }
}
