package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "listening_exercises")
@Getter
@Setter
public class ListeningExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "level_min", nullable = false)
    private VocabularyItem.Level levelMin;

    @Enumerated(EnumType.STRING)
    @Column(name = "level_max", nullable = false)
    private VocabularyItem.Level levelMax;

    @Column(name = "youtube_video_id", nullable = false)
    private String youtubeVideoId;

    private String description;

    private String topic;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
