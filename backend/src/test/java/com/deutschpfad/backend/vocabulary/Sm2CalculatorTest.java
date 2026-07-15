package com.deutschpfad.backend.vocabulary;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class Sm2CalculatorTest {

    @Test
    void firstCorrectAnswer_setsIntervalToOneDay() {
        Sm2Calculator.Result result = Sm2Calculator.calculate(0, 2.5, 0, 3);

        assertThat(result.repetitions()).isEqualTo(1);
        assertThat(result.intervalDays()).isEqualTo(1);
        assertThat(result.nextReviewDate()).isEqualTo(LocalDate.now().plusDays(1));
    }

    @Test
    void secondCorrectAnswer_setsIntervalToSixDays() {
        Sm2Calculator.Result result = Sm2Calculator.calculate(1, 2.5, 1, 3);

        assertThat(result.repetitions()).isEqualTo(2);
        assertThat(result.intervalDays()).isEqualTo(6);
    }

    @Test
    void thirdCorrectAnswer_multipliesIntervalByEaseFactor() {
        Sm2Calculator.Result result = Sm2Calculator.calculate(2, 2.5, 6, 3);

        assertThat(result.repetitions()).isEqualTo(3);
        assertThat(result.intervalDays()).isEqualTo(15);
    }

    @Test
    void forgotAnswer_resetsRepetitionsAndInterval() {
        Sm2Calculator.Result result = Sm2Calculator.calculate(5, 2.5, 30, 0);

        assertThat(result.repetitions()).isEqualTo(0);
        assertThat(result.intervalDays()).isEqualTo(1);
    }

    @Test
    void easeFactorNeverGoesBelowMinimum() {
        Sm2Calculator.Result result = Sm2Calculator.calculate(3, 1.3, 10, 0);

        assertThat(result.easeFactor()).isEqualTo(1.3);
    }
}
