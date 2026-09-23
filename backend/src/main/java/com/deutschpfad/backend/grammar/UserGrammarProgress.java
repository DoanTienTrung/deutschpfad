package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

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
    }
}
