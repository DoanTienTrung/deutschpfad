package com.deutschpfad.backend.dashboard;

import java.time.LocalDate;
import java.util.List;

/** Mọi số liệu của trang chủ trong một lần gọi. */
public record DashboardResponse(
    int dailyGoalMinutes,
    Streak streak,
    Vocabulary vocabulary,
    StudyTime studyTime,
    Grammar grammar,
    /** Số thẻ đến hạn trong 7 ngày tới; phần tử đầu là hôm nay (gồm cả thẻ quá hạn). */
    List<DayCount> reviewForecast,
    List<ContinueItem> continueLearning,
    Onboarding onboarding
) {
    public record Streak(int current, int longest) {}

    /**
     * Mức thuộc từ, chia theo lịch ôn SM-2. Bốn nhóm không chồng nhau:
     * chưa nhớ (repetitions = 0), đang học (= 1), đã thuộc (>= 2, khoảng cách < 21 ngày), nhớ lâu (>= 21 ngày).
     */
    public record Vocabulary(
        long total,
        long notYet,
        long learning,
        long known,
        long longTerm,
        long newThisWeek,
        long dueToday
    ) {}

    /** Phút học 14 ngày gần nhất, cũ trước, hôm nay cuối; cộng tổng tuần này và tuần trước để so sánh. */
    public record StudyTime(List<DayCount> last14Days, long thisWeekSeconds, long lastWeekSeconds) {}

    public record Grammar(long mastered, long totalTopics) {}

    public record DayCount(LocalDate date, long value) {}

    /** type: LESSON | GRAMMAR. progress/progressTotal: số chế độ đã xong / 6, hoặc câu đúng / câu đã làm. */
    public record ContinueItem(String type, String title, String subtitle, String href, int progress, int progressTotal) {}

    /** Ba bước làm quen cho tài khoản mới (bước bảng chữ cái do trình duyệt tự nhớ). */
    public record Onboarding(boolean learnedFirstWords, boolean reviewedOnLaterDay) {}
}
