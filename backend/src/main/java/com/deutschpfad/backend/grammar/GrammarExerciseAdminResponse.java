package com.deutschpfad.backend.grammar;

// Bản đầy đủ (có đáp án + nguồn sinh + trạng thái duyệt) -- chỉ dùng ở các endpoint
// /api/admin/** đã khoá bằng hasRole('ADMIN').
public record GrammarExerciseAdminResponse(
    Long id,
    int orderIndex,
    GrammarExercise.ExerciseType exerciseType,
    String promptDe,
    String hintVi,
    String optionA,
    String optionB,
    String optionC,
    String optionD,
    String correctAnswer,
    String explanationVi,
    GrammarExercise.GeneratedBy generatedBy,
    boolean reviewed
) {
    public static GrammarExerciseAdminResponse from(GrammarExercise exercise) {
        return new GrammarExerciseAdminResponse(
            exercise.getId(),
            exercise.getOrderIndex(),
            exercise.getExerciseType(),
            exercise.getPromptDe(),
            exercise.getHintVi(),
            exercise.getOptionA(),
            exercise.getOptionB(),
            exercise.getOptionC(),
            exercise.getOptionD(),
            exercise.getCorrectAnswer(),
            exercise.getExplanationVi(),
            exercise.getGeneratedBy(),
            exercise.isReviewed()
        );
    }
}
