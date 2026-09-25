package com.deutschpfad.backend.grammar;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "grammar_exercises")
@Getter
@Setter
public class GrammarExercise {

    // FILL_BLANK / CONJUGATE: học viên gõ đáp án vào chỗ "___" trong promptDe.
    // MULTIPLE_CHOICE: chọn 1 trong optionA..optionD, correctAnswer là "A"/"B"/"C"/"D".
    // WORD_ORDER: sắp xếp các từ (promptDe liệt kê các từ xáo trộn ngăn bằng " / "), correctAnswer
    // là câu hoàn chỉnh.
    // ERROR_CORRECTION: prompt_de là câu SAI, correct_answer là câu đã sửa. Dạng này bắt người
    // học tự phát hiện lỗi thay vì chỉ điền vào chỗ đã được chỉ sẵn — sát với lúc tự viết.
    public enum ExerciseType { FILL_BLANK, MULTIPLE_CHOICE, CONJUGATE, WORD_ORDER, ERROR_CORRECTION }

    // MANUAL: admin gõ tay. DATA: sinh deterministic từ german_noun_genders/vocabulary_items
    // (đúng 100%, tự duyệt luôn). AI: model soạn nháp, phải được admin duyệt mới hiển thị.
    public enum GeneratedBy { MANUAL, DATA, AI }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private GrammarTopic topic;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "exercise_type", nullable = false)
    private ExerciseType exerciseType;

    @Column(name = "prompt_de", nullable = false, columnDefinition = "TEXT")
    private String promptDe;

    @Column(name = "hint_vi", columnDefinition = "TEXT")
    private String hintVi;

    @Column(name = "option_a", columnDefinition = "TEXT")
    private String optionA;

    @Column(name = "option_b", columnDefinition = "TEXT")
    private String optionB;

    @Column(name = "option_c", columnDefinition = "TEXT")
    private String optionC;

    @Column(name = "option_d", columnDefinition = "TEXT")
    private String optionD;

    // Nhiều đáp án chấp nhận được ngăn bằng "/" (vd. "ist/ist nicht") -- cùng quy ước với
    // ReadingQuestion.correctAnswer, nên logic chấm dùng chung được.
    @Column(name = "correct_answer", nullable = false, columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(name = "explanation_vi", columnDefinition = "TEXT")
    private String explanationVi;

    @Enumerated(EnumType.STRING)
    @Column(name = "generated_by", nullable = false)
    private GeneratedBy generatedBy = GeneratedBy.MANUAL;

    @Column(nullable = false)
    private boolean reviewed = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
