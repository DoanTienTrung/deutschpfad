package com.deutschpfad.backend.grammar;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GrammarExerciseRequest(
    @NotNull GrammarExercise.ExerciseType exerciseType,
    @NotBlank String promptDe,
    String hintVi,
    String optionA,
    String optionB,
    String optionC,
    String optionD,
    @NotBlank String correctAnswer,
    String explanationVi,
    Integer orderIndex
) {
}
