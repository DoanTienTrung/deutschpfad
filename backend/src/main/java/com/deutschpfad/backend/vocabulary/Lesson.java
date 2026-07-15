package com.deutschpfad.backend.vocabulary;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "lessons")
@Getter
@Setter
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VocabularyItem.Level level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VocabularyItem.Source source = VocabularyItem.Source.FREQUENCY;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    private String description;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
