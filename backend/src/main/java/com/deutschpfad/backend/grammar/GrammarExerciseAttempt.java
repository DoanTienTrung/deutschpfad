package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Một lần trả lời một câu cụ thể. Khác {@link UserGrammarProgress} vốn chỉ đếm tổng theo chủ điểm,
 * bảng này giữ chi tiết từng câu — nhờ đó mới biết người học yếu ở dạng bài nào, và admin nhìn ra
 * được bài tập nào bị đa số trả lời sai (dấu hiệu bài soạn sai hoặc gây hiểu nhầm).
 */
@Entity
@Table(name = "grammar_exercise_attempts")
@Getter
@Setter
public class GrammarExerciseAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private GrammarExercise exercise;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "submitted_answer", columnDefinition = "TEXT")
    private String submittedAnswer;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt = LocalDateTime.now();
}
