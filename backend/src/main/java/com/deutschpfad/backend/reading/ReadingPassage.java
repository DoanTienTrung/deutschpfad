package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_passages")
@Getter
@Setter
public class ReadingPassage {

    public enum Category { EXAM, ARTICLE }

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

    private String topic;

    @Column(name = "source_label")
    private String sourceLabel;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // Full Vietnamese translation of `content`, generated lazily on first practice-page read (and
    // regenerated whenever `content` changes) so ReadingPracticePage can show it side-by-side.
    @Column(name = "content_translation", columnDefinition = "TEXT")
    private String contentTranslation;

    // Cover image fetched from Unsplash by topic/title, generated once at creation and cached.
    // Attribution fields are required by Unsplash's API usage guidelines.
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "image_attribution_name")
    private String imageAttributionName;

    @Column(name = "image_attribution_url", columnDefinition = "TEXT")
    private String imageAttributionUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category = Category.EXAM;

    // Null = shared content (exam Modellsatz or admin-curated articles). Non-null = private,
    // visible only to that user (their own pasted reading material under "Bài đọc của tôi").
    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
