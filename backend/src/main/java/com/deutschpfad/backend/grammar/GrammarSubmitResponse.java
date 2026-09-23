package com.deutschpfad.backend.grammar;

import java.util.List;

public record GrammarSubmitResponse(int correctCount, int totalCount, List<ExerciseResult> results) {
    public record ExerciseResult(
        Long exerciseId,
        boolean correct,
        String submittedAnswer,
        String correctAnswer,
        String explanationVi
    ) {
    }
}
