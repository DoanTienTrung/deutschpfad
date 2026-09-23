package com.deutschpfad.backend.grammar;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GrammarGradingServiceTest {

    private final GrammarGradingService grading = new GrammarGradingService();

    private GrammarExercise exerciseWithAnswer(String correctAnswer) {
        GrammarExercise exercise = new GrammarExercise();
        exercise.setExerciseType(GrammarExercise.ExerciseType.FILL_BLANK);
        exercise.setPromptDe("Ich ___ Student.");
        exercise.setCorrectAnswer(correctAnswer);
        return exercise;
    }

    @Test
    void exactAnswer_isCorrect() {
        assertThat(grading.isCorrect(exerciseWithAnswer("bin"), "bin")).isTrue();
    }

    @Test
    void answerWithSurroundingSpacesAndDifferentCase_isCorrect() {
        assertThat(grading.isCorrect(exerciseWithAnswer("bin"), "  BIN ")).isTrue();
    }

    @Test
    void anyOfTheSlashSeparatedAnswers_isAccepted() {
        GrammarExercise exercise = exerciseWithAnswer("am Montag/montags");

        assertThat(grading.isCorrect(exercise, "montags")).isTrue();
        assertThat(grading.isCorrect(exercise, "am Montag")).isTrue();
        assertThat(grading.isCorrect(exercise, "Montag")).isFalse();
    }

    @Test
    void asciiSpellingOfUmlauts_isAccepted() {
        assertThat(grading.isCorrect(exerciseWithAnswer("älter"), "aelter")).isTrue();
        assertThat(grading.isCorrect(exerciseWithAnswer("größer"), "groesser")).isTrue();
    }

    @Test
    void missingUmlautEntirely_isStillWrong() {
        // "alter" không phải cách gõ thay thế hợp lệ của "älter" -- bài luyện Umlaut phải bắt được
        // lỗi này, nếu không thì cả dạng bài Komparativ mất ý nghĩa.
        assertThat(grading.isCorrect(exerciseWithAnswer("älter"), "alter")).isFalse();
    }

    @Test
    void trailingPunctuationAndRepeatedSpaces_areIgnoredForWordOrder() {
        GrammarExercise exercise = exerciseWithAnswer("Am Montag gehe ich ins Kino");
        exercise.setExerciseType(GrammarExercise.ExerciseType.WORD_ORDER);

        assertThat(grading.isCorrect(exercise, "Am  Montag gehe ich  ins Kino.")).isTrue();
    }

    @Test
    void blankOrMissingAnswer_isWrong() {
        assertThat(grading.isCorrect(exerciseWithAnswer("bin"), "   ")).isFalse();
        assertThat(grading.isCorrect(exerciseWithAnswer("bin"), null)).isFalse();
    }
}
