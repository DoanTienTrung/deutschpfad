package com.deutschpfad.backend.grammar;

// Cố tình KHÔNG có correctAnswer/explanationVi -- response này gửi cho UI luyện tập trước lúc
// chấm, nên đáp án không được lộ ra (vd. qua tab Network của trình duyệt). Giống hệt cách
// ReadingQuestionPracticeResponse giấu đáp án bên Đọc.
public record GrammarExercisePracticeResponse(
    Long id,
    int orderIndex,
    GrammarExercise.ExerciseType exerciseType,
    String promptDe,
    String hintVi,
    String optionA,
    String optionB,
    String optionC,
    String optionD
) {
    public static GrammarExercisePracticeResponse from(GrammarExercise exercise) {
        return new GrammarExercisePracticeResponse(
            exercise.getId(),
            exercise.getOrderIndex(),
            exercise.getExerciseType(),
            exercise.getPromptDe(),
            exercise.getHintVi(),
            exercise.getOptionA(),
            exercise.getOptionB(),
            exercise.getOptionC(),
            exercise.getOptionD()
        );
    }
}
