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

    @Column(name = "youtube_video_id")
    private String youtubeVideoId;

    // Direct link to a standalone audio file (e.g. an official exam Modellsatz MP3), used
    // instead of youtubeVideoId for exercises that aren't tied to a YouTube video.
    @Column(name = "audio_url")
    private String audioUrl;

    // Attribution shown to the user for licensed/official practice material (e.g. "Goethe-Institut
    // Modellsatz B1 – Hören Teil 2"), with an optional link back to the original source.
    @Column(name = "source_label")
    private String sourceLabel;

    @Column(name = "source_url")
    private String sourceUrl;

    private String description;

    private String topic;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
