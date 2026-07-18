package com.deutschpfad.backend.reading;

public record ReadingQuestionAdminResponse(
    Long id,
    int orderIndex,
    String questionText,
    ReadingQuestion.QuestionType questionType,
    String optionA,
    String optionB,
    String optionC,
    String optionD,
    String correctAnswer,
    String explanation
) {
    public static ReadingQuestionAdminResponse from(ReadingQuestion question) {
        return new ReadingQuestionAdminResponse(
            question.getId(),
            question.getOrderIndex(),
            question.getQuestionText(),
            question.getQuestionType(),
            question.getOptionA(),
            question.getOptionB(),
            question.getOptionC(),
            question.getOptionD(),
            question.getCorrectAnswer(),
            question.getExplanation()
        );
    }
}
