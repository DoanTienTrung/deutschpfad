package com.deutschpfad.backend.grammar;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserGrammarProgressTest {

    private UserGrammarProgress fresh() {
        return new UserGrammarProgress();
    }

    @Test
    void newProgress_startsAsLearningWithNothingCounted() {
        UserGrammarProgress progress = fresh();

        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.LEARNING);
        assertThat(progress.getTotalCount()).isZero();
        assertThat(progress.accuracy()).isZero();
    }

    @Test
    void attemptsAccumulateAcrossSubmissions() {
        UserGrammarProgress progress = fresh();

        progress.recordAttempt(3, 5);
        progress.recordAttempt(4, 5);

        assertThat(progress.getCorrectCount()).isEqualTo(7);
        assertThat(progress.getTotalCount()).isEqualTo(10);
        assertThat(progress.getLastPracticedAt()).isNotNull();
    }

    @Test
    void enoughAnswersAndHighAccuracy_becomesMastered() {
        UserGrammarProgress progress = fresh();

        progress.recordAttempt(8, 10);

        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.MASTERED);
    }

    @Test
    void highAccuracyButTooFewAnswers_staysLearning() {
        UserGrammarProgress progress = fresh();

        progress.recordAttempt(5, 5);

        assertThat(progress.accuracy()).isEqualTo(1.0);
        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.LEARNING);
    }

    @Test
    void enoughAnswersButLowAccuracy_staysLearning() {
        UserGrammarProgress progress = fresh();

        progress.recordAttempt(7, 10);

        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.LEARNING);
    }

    @Test
    void masteryIsNotLostAfterALaterBadAttempt() {
        UserGrammarProgress progress = fresh();
        progress.recordAttempt(10, 10);
        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.MASTERED);

        // Làm lại kém hẳn, tỉ lệ chung tụt xuống dưới ngưỡng...
        progress.recordAttempt(0, 20);

        assertThat(progress.accuracy()).isLessThan(UserGrammarProgress.MASTERY_MIN_ACCURACY);
        // ...nhưng mốc đã đạt thì giữ: đây là mốc ghi nhận tiến bộ, không phải điểm số liên tục.
        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.MASTERED);
    }

    @Test
    void masteryCanBeReachedGradually() {
        UserGrammarProgress progress = fresh();

        progress.recordAttempt(4, 4);
        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.LEARNING);
        progress.recordAttempt(4, 4);
        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.LEARNING);
        progress.recordAttempt(2, 4);

        // 4+4+2 = 10 dung tren 12 cau = 0.833 >= 0.8
        assertThat(progress.getTotalCount()).isEqualTo(12);
        assertThat(progress.accuracy()).isGreaterThanOrEqualTo(UserGrammarProgress.MASTERY_MIN_ACCURACY);
        assertThat(progress.getStatus()).isEqualTo(UserGrammarProgress.Status.MASTERED);
    }
}
