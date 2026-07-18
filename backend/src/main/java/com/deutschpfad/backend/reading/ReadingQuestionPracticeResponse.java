package com.deutschpfad.backend.reading;

// Deliberately excludes correctAnswer/explanation -- sent to the practice UI before grading, so
// the answer must never be visible in this response (e.g. via the browser network tab).
public record ReadingQuestionPracticeResponse(
    Long id,
    int orderIndex,
    String questionText,
    ReadingQuestion.QuestionType questionType,
    String optionA,
    String optionB,
    String optionC,
    String optionD
) {
    public static ReadingQuestionPracticeResponse from(ReadingQuestion question) {
        return new ReadingQuestionPracticeResponse(
            question.getId(),
            question.getOrderIndex(),
            question.getQuestionText(),
            question.getQuestionType(),
            question.getOptionA(),
            question.getOptionB(),
            question.getOptionC(),
            question.getOptionD()
        );
    }
}
