package com.deutschpfad.backend.grammar;

/**
 * Một bài tập do AI soạn nháp, chưa lưu DB. Tách riêng khỏi {@link GrammarExerciseRequest} (đầu
 * vào form admin) vì đây là đầu ra của tầng AI và luôn phải qua bước duyệt mới hiển thị.
 */
public record GrammarExerciseDraft(
    GrammarExercise.ExerciseType exerciseType,
    String promptDe,
    String optionA,
    String optionB,
    String optionC,
    String correctAnswer,
    String explanationVi
) {
}
