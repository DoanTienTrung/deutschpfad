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
    void commasAreIgnored_soCorrectGermanPunctuationIsNotPunished() {
        // Tiếng Đức bắt buộc dấu phẩy trước mệnh đề phụ. Người học viết đúng sẽ có dấu phẩy;
        // đáp án trong DB có thể không — chấm sai vì chuyện đó là phạt người viết đúng.
        GrammarExercise exercise = exerciseWithAnswer("Ich lerne, um die Prüfung zu bestehen");
        exercise.setExerciseType(GrammarExercise.ExerciseType.WORD_ORDER);

        assertThat(grading.isCorrect(exercise, "Ich lerne, um die Prüfung zu bestehen")).isTrue();
        assertThat(grading.isCorrect(exercise, "Ich lerne um die Prüfung zu bestehen")).isTrue();
    }

    @Test
    void wordOrderStillMattersEvenWithoutCommas() {
        // Bỏ dấu phẩy không được làm mất khả năng bắt lỗi trật tự từ.
        GrammarExercise exercise = exerciseWithAnswer("Heute lerne ich Deutsch");
        exercise.setExerciseType(GrammarExercise.ExerciseType.WORD_ORDER);

        assertThat(grading.isCorrect(exercise, "Heute lerne ich Deutsch")).isTrue();
        assertThat(grading.isCorrect(exercise, "Heute ich lerne Deutsch")).isFalse();
    }

    @Test
    void errorCorrection_acceptsTheFixedSentenceAndRejectsTheOriginalError() {
        // Dạng ERROR_CORRECTION nộp lên cả câu. Phải nhận câu đã sửa (kể cả gõ ue thay ü) và vẫn
        // từ chối đúng cái câu sai in trong đề — nếu không thì người học bấm copy đề là xong bài.
        GrammarExercise exercise = exerciseWithAnswer("Der Zug kommt um acht Uhr an");
        exercise.setExerciseType(GrammarExercise.ExerciseType.ERROR_CORRECTION);

        assertThat(grading.isCorrect(exercise, "Der Zug kommt um acht Uhr an.")).isTrue();
        assertThat(grading.isCorrect(exercise, "der zug kommt um acht uhr an")).isTrue();
        assertThat(grading.isCorrect(exercise, "Der Zug ankommt um acht Uhr.")).isFalse();
    }

    @Test
    void blankOrMissingAnswer_isWrong() {
        assertThat(grading.isCorrect(exerciseWithAnswer("bin"), "   ")).isFalse();
        assertThat(grading.isCorrect(exerciseWithAnswer("bin"), null)).isFalse();
    }
}
