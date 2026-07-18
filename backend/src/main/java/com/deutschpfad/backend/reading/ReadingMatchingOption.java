package com.deutschpfad.backend.reading;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// A shared pool of lettered choices (e.g. ads A-J) that MATCHING-type ReadingQuestions in the
// same passage reference by letter -- one pool per passage, not per question, since the real
// Goethe "Zuordnung" task lets each option be used at most once across all situations.
@Entity
@Table(name = "reading_matching_options")
@Getter
@Setter
public class ReadingMatchingOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "passage_id", nullable = false)
    private ReadingPassage passage;

    @Column(nullable = false, length = 2)
    private String letter;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
