package com.deutschpfad.backend.vocabulary;

import java.time.LocalDate;

public record StreakResponse(int currentStreak, int longestStreak, LocalDate lastActiveDate) {
    /**
     * Chuỗi chỉ được tính lại khi người học hoạt động (recordActivity), nên nếu đã nghỉ từ hôm kia trở
     * về trước thì con số lưu trong DB vẫn là chuỗi cũ. Hiện 0 cho đúng: chuỗi đã đứt.
     */
    public static StreakResponse from(LearningStreak streak) {
        LocalDate last = streak.getLastActiveDate();
        boolean alive = last != null && !last.isBefore(LocalDate.now().minusDays(1));
        return new StreakResponse(alive ? streak.getCurrentStreak() : 0, streak.getLongestStreak(), last);
    }
}
