package com.deutschpfad.backend.vocabulary;

import jakarta.persistence.*;
import lombok.AccessLevel;
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

    /**
     * Khoá định danh TỪ, dùng để lịch ôn SM-2 gắn với từ chứ không gắn với dòng — cùng một
     * "die Mutter" ở 3 lộ trình chỉ có một lịch ôn. Luôn được tính lại từ {@link #germanWord} trước
     * khi ghi, không set tay. Xem {@link WordKey}.
     */
    @Column(name = "word_key", nullable = false)
    @Setter(AccessLevel.NONE)
    private String wordKey;

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

    @Column(name = "example_sentence_highlight")
    private String exampleSentenceHighlight;

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

    // Mọi đường ghi qua JPA (admin thêm/sửa, AI kiểm duyệt…) đều đi qua đây, nên khoá không thể
    // lệch với germanWord. Riêng migration SQL sửa german_word thì phải tự cập nhật word_key.
    @PrePersist
    @PreUpdate
    void syncWordKey() {
        this.wordKey = WordKey.of(germanWord);
    }

    public enum Level {
        A1, A2, B1, B2, C1, C2
    }

    public enum Source {
        FREQUENCY, GOETHE, TEXTBOOK
    }
}
