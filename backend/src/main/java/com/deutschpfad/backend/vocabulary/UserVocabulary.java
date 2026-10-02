package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_vocabulary")
@Getter
@Setter
public class UserVocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Dòng mà người học gặp từ này lần đầu — dùng để hiển thị thẻ ôn tập. */
    @ManyToOne
    @JoinColumn(name = "vocabulary_item_id", nullable = false)
    private VocabularyItem vocabularyItem;

    /**
     * Lịch ôn gắn với TỪ, không gắn với dòng: unique (user_id, word_key). Cùng một "die Mutter" ở
     * cả 3 lộ trình chỉ có một lịch ôn. Xem {@link WordKey}.
     */
    @Column(name = "word_key", nullable = false)
    private String wordKey;

    @Column(nullable = false)
    private int repetitions = 0;

    @Column(name = "ease_factor", nullable = false)
    private double easeFactor = 2.5;

    @Column(name = "interval_days", nullable = false)
    private int intervalDays = 0;

    @Column(name = "next_review_date", nullable = false)
    private LocalDate nextReviewDate = LocalDate.now();

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
