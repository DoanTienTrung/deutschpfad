package com.deutschpfad.backend.translation;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** Một lần người học nộp bản dịch (hoặc bấm xem đáp án) cho một câu. */
@Entity
@Table(name = "translation_attempts")
@Getter
@Setter
public class TranslationAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Mode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Verdict verdict;

    @Enumerated(EnumType.STRING)
    @Column(name = "judged_by", nullable = false)
    private JudgedBy judgedBy;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Mode { WORD_BANK, TYPING, REVEAL }

    /** UNGRADED: đã hết lượt chấm AI trong ngày (hoặc AI lỗi), người học tự so với câu mẫu. */
    public enum Verdict {
        CORRECT, ALMOST, WRONG, REVEALED, UNGRADED;

        public boolean passed() {
            return this == CORRECT || this == ALMOST;
        }
    }

    public enum JudgedBy { LOCAL, CACHE, AI, NONE }
}
