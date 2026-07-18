package com.deutschpfad.backend.vocabulary;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_deck_items")
@Getter
@Setter
public class UserDeckItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "deck_id", nullable = false)
    private UserDeck deck;

    @Column(name = "german_word", nullable = false)
    private String germanWord;

    @Column(name = "vietnamese_meaning", nullable = false)
    private String vietnameseMeaning;

    @Column(name = "word_type")
    private String wordType;

    @Column(name = "example_sentence")
    private String exampleSentence;

    @Column(name = "phonetic")
    private String phonetic;

    @Column(name = "english_meaning")
    private String englishMeaning;

    @Column(name = "synonyms")
    private String synonyms;

    @Column(name = "antonyms")
    private String antonyms;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
