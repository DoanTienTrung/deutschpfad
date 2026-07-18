package com.deutschpfad.backend.reading;

import java.util.List;

public record ReadingSubmitResponse(int correctCount, int totalCount, List<QuestionResult> results) {
    public record QuestionResult(
        Long questionId, boolean correct, String submittedAnswer, String correctAnswer, String explanation
    ) {
    }
}
