package com.deutschpfad.backend.reading;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// Caches an AI-translated word per passage so the same word is never re-sent to the AI more than
// once for that passage, regardless of how many times/users hover over it.
@Entity
@Table(name = "reading_word_translations")
@Getter
@Setter
public class ReadingWordTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "passage_id", nullable = false)
    private ReadingPassage passage;

    // Lowercased so "Umwelt" and "umwelt" share one cache entry.
    @Column(nullable = false)
    private String word;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String translation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
