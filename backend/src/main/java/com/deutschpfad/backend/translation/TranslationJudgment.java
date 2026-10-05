package com.deutschpfad.backend.translation;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** Kết quả AI chấm một bản dịch, dùng lại cho mọi câu trả lời giống hệt (sau chuẩn hoá) của cùng câu nguồn. */
@Entity
@Table(name = "translation_judgments")
@Getter
@Setter
public class TranslationJudgment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "answer_key", nullable = false, columnDefinition = "TEXT")
    private String answerKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TranslationAttempt.Verdict verdict;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
