package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.vocabulary.Sm2Calculator;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Tiến độ của một người học trên một chủ điểm. Đếm dồn qua mọi lần nộp bài chứ không ghi đè theo
 * lần nộp gần nhất — làm đi làm lại là cách chủ điểm tiến tới "thành thạo", nên lần nộp kém không
 * xoá sạch công sức trước đó.
 */
@Entity
@Table(name = "user_grammar_progress")
@Getter
@Setter
public class UserGrammarProgress {

    public enum Status { LEARNING, MASTERED }

    /** Ngưỡng thành thạo: làm đủ 10 câu và đúng từ 80% trở lên. */
    public static final int MASTERY_MIN_ANSWERS = 10;
    public static final double MASTERY_MIN_ACCURACY = 0.8;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private GrammarTopic topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.LEARNING;

    @Column(name = "correct_count", nullable = false)
    private int correctCount;

    @Column(name = "total_count", nullable = false)
    private int totalCount;

    @Column(name = "last_practiced_at")
    private LocalDateTime lastPracticedAt;

    // Bộ tham số SM-2, cùng thuật toán với module Từ vựng (xem Sm2Calculator).
    @Column(nullable = false)
    private int repetitions;

    @Column(name = "ease_factor", nullable = false)
    private double easeFactor = 2.5;

    @Column(name = "interval_days", nullable = false)
    private int intervalDays;

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;

    public double accuracy() {
        return totalCount == 0 ? 0 : (double) correctCount / totalCount;
    }

    /**
     * Một khi đã đạt thành thạo thì giữ nguyên, không tụt lại vì một lần làm kém sau đó — mốc này
     * để ghi nhận tiến bộ, không phải để chấm điểm liên tục.
     */
    public void recordAttempt(int correct, int total) {
        correctCount += correct;
        totalCount += total;
        lastPracticedAt = LocalDateTime.now();
        if (status != Status.MASTERED
            && totalCount >= MASTERY_MIN_ANSWERS
            && accuracy() >= MASTERY_MIN_ACCURACY) {
            status = Status.MASTERED;
        }
        scheduleNextReview(correct, total);
    }

    /**
     * Lên lịch ôn lại bằng chính thuật toán SM-2 của module Từ vựng.
     *
     * <p>SM-2 nhận điểm chất lượng 0-5; ở đây quy đổi từ tỉ lệ đúng của LẦN NỘP NÀY (không phải
     * tỉ lệ cộng dồn): làm tốt thì giãn lịch ra, làm kém thì kéo về ôn lại sớm. Ngưỡng 3 là mốc
     * SM-2 coi là "nhớ được" — dưới đó thuật toán tự đặt lại chuỗi lặp về 0.
     */
    private void scheduleNextReview(int correct, int total) {
        int quality = total == 0 ? 0 : (int) Math.round((double) correct / total * 5);
        Sm2Calculator.Result result = Sm2Calculator.calculate(repetitions, easeFactor, intervalDays, quality);
        repetitions = result.repetitions();
        easeFactor = result.easeFactor();
        intervalDays = result.intervalDays();
        nextReviewDate = result.nextReviewDate();
    }

    public boolean isDue() {
        return nextReviewDate != null && !nextReviewDate.isAfter(LocalDate.now());
    }
}
