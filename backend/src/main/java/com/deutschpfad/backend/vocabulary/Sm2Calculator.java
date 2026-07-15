package com.deutschpfad.backend.vocabulary;

import java.time.LocalDate;

public class Sm2Calculator {

    public record Result(int repetitions, double easeFactor, int intervalDays, LocalDate nextReviewDate) {}

    public static Result calculate(int repetitions, double easeFactor, int intervalDays, int quality) {
        int newRepetitions;
        int newInterval;

        if (quality < 3) {
            newRepetitions = 0;
            newInterval = 1;
        } else {
            newRepetitions = repetitions + 1;
            if (newRepetitions == 1) {
                newInterval = 1;
            } else if (newRepetitions == 2) {
                newInterval = 6;
            } else {
                newInterval = (int) Math.round(intervalDays * easeFactor);
            }
        }

        double newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3) {
            newEaseFactor = 1.3;
        }

        return new Result(newRepetitions, newEaseFactor, newInterval, LocalDate.now().plusDays(newInterval));
    }
}
