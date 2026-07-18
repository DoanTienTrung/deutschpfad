package com.deutschpfad.backend.reading;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReadingQuestionInput(
    @NotBlank String questionText,
    @NotNull ReadingQuestion.QuestionType questionType,
    String optionA,
    String optionB,
    String optionC,
    String optionD,
    @NotBlank String correctAnswer,
    String explanation
) {
}
