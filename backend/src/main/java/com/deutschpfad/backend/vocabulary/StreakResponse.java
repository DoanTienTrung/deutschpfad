package com.deutschpfad.backend.vocabulary;

import java.time.LocalDate;

public record StreakResponse(int currentStreak, int longestStreak, LocalDate lastActiveDate) {
    public static StreakResponse from(LearningStreak streak) {
        return new StreakResponse(streak.getCurrentStreak(), streak.getLongestStreak(), streak.getLastActiveDate());
    }
}
