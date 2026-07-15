package com.deutschpfad.backend.vocabulary;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "vocabulary_items")
@Getter
@Setter
public class VocabularyItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "german_word", nullable = false)
    private String germanWord;

    @Column(name = "vietnamese_meaning", nullable = false)
    private String vietnameseMeaning;

    @Column(name = "english_meaning")
    private String englishMeaning;

    @Column(name = "phonetic")
    private String phonetic;

    @Column(name = "word_type")
    private String wordType;

    @Column(name = "example_sentence")
    private String exampleSentence;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source = Source.FREQUENCY;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Level {
        A1, A2, B1, B2, C1, C2
    }

    public enum Source {
        FREQUENCY, GOETHE
    }
}
