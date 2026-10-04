package com.deutschpfad.backend.dashboard;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.vocabulary.LearningStreakService;
import com.deutschpfad.backend.vocabulary.StreakResponse;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import com.deutschpfad.backend.vocabulary.VocabularyVisibility;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Số liệu trang chủ. Dùng truy vấn gộp (JdbcTemplate) thay vì tải từng dòng qua JPA: người học lâu năm có
 * hàng nghìn thẻ, trang chủ chỉ cần vài con số đếm.
 *
 * <p>Mọi mốc ngày lấy từ {@link LocalDate#now()} của ứng dụng rồi truyền vào SQL, không dùng
 * {@code current_date} của Postgres - hai bên có thể khác múi giờ, và phần còn lại của app (lịch ôn,
 * chuỗi ngày, thời gian học) đều tính ngày theo ứng dụng.
 */
@Service
public class DashboardService {

    static final int FORECAST_DAYS = 7;
    static final int STUDY_DAYS = 14;
    static final int LONG_TERM_INTERVAL_DAYS = 21;
    static final int LESSON_MODES = 6;

    private final JdbcTemplate jdbc;
    private final LearningStreakService streakService;
    private final VocabularyVisibility visibility;

    public DashboardService(JdbcTemplate jdbc, LearningStreakService streakService, VocabularyVisibility visibility) {
        this.jdbc = jdbc;
        this.streakService = streakService;
        this.visibility = visibility;
    }

    public DashboardResponse build(User user) {
        LocalDate today = LocalDate.now();
        StreakResponse streak = StreakResponse.from(streakService.getStreak(user));
        DashboardResponse.Vocabulary vocabulary = vocabulary(user, today);
        return new DashboardResponse(
            user.getDailyGoalMinutes(),
            new DashboardResponse.Streak(streak.currentStreak(), streak.longestStreak()),
            vocabulary,
            studyTime(user, today),
            grammar(user),
            forecast(user, today),
            continueLearning(user),
            new DashboardResponse.Onboarding(vocabulary.total() > 0, reviewedOnLaterDay(user))
        );
    }

    private DashboardResponse.Vocabulary vocabulary(User user, LocalDate today) {
        return jdbc.queryForObject("""
            SELECT count(*) AS total,
                   count(*) FILTER (WHERE repetitions = 0) AS not_yet,
                   count(*) FILTER (WHERE repetitions = 1) AS learning,
                   count(*) FILTER (WHERE repetitions >= 2 AND interval_days < ?) AS known,
                   count(*) FILTER (WHERE repetitions >= 2 AND interval_days >= ?) AS long_term,
                   count(*) FILTER (WHERE created_at >= ?) AS new_this_week,
                   count(*) FILTER (WHERE next_review_date <= ?) AS due_today
              FROM user_vocabulary WHERE user_id = ?
            """,
            (rs, i) -> new DashboardResponse.Vocabulary(
                rs.getLong("total"), rs.getLong("not_yet"), rs.getLong("learning"), rs.getLong("known"),
                rs.getLong("long_term"), rs.getLong("new_this_week"), rs.getLong("due_today")),
            LONG_TERM_INTERVAL_DAYS, LONG_TERM_INTERVAL_DAYS,
            Timestamp.valueOf(today.minusDays(6).atStartOfDay()), Date.valueOf(today), user.getId());
    }

    private DashboardResponse.StudyTime studyTime(User user, LocalDate today) {
        LocalDate from = today.minusDays(STUDY_DAYS - 1);
        Map<LocalDate, Long> byDay = new HashMap<>();
        jdbc.query("SELECT study_date, seconds FROM study_time_daily WHERE user_id = ? AND study_date >= ?",
            rs -> {
                byDay.put(rs.getDate("study_date").toLocalDate(), rs.getLong("seconds"));
            },
            user.getId(), Date.valueOf(from));

        List<DashboardResponse.DayCount> days = new ArrayList<>();
        long thisWeek = 0;
        long lastWeek = 0;
        for (int i = 0; i < STUDY_DAYS; i++) {
            LocalDate d = from.plusDays(i);
            long seconds = byDay.getOrDefault(d, 0L);
            days.add(new DashboardResponse.DayCount(d, seconds));
            if (i >= STUDY_DAYS - 7) thisWeek += seconds;
            else lastWeek += seconds;
        }
        return new DashboardResponse.StudyTime(days, thisWeek, lastWeek);
    }

    private DashboardResponse.Grammar grammar(User user) {
        Long mastered = jdbc.queryForObject(
            "SELECT count(*) FROM user_grammar_progress WHERE user_id = ? AND status = 'MASTERED'", Long.class, user.getId());
        Long total = jdbc.queryForObject("SELECT count(*) FROM grammar_topics", Long.class);
        return new DashboardResponse.Grammar(mastered == null ? 0 : mastered, total == null ? 0 : total);
    }

    private List<DashboardResponse.DayCount> forecast(User user, LocalDate today) {
        long[] counts = new long[FORECAST_DAYS];
        jdbc.query("SELECT next_review_date, count(*) AS n FROM user_vocabulary WHERE user_id = ? AND next_review_date < ? GROUP BY 1",
            rs -> {
                LocalDate d = rs.getDate("next_review_date").toLocalDate();
                // Thẻ quá hạn dồn vào hôm nay: hôm nay là lúc phải ôn chúng.
                int offset = (int) Math.max(0, d.toEpochDay() - today.toEpochDay());
                counts[offset] += rs.getLong("n");
            },
            user.getId(), Date.valueOf(today.plusDays(FORECAST_DAYS)));
        List<DashboardResponse.DayCount> result = new ArrayList<>();
        for (int i = 0; i < FORECAST_DAYS; i++) result.add(new DashboardResponse.DayCount(today.plusDays(i), counts[i]));
        return result;
    }

    private record Candidate(DashboardResponse.ContinueItem item, LocalDateTime at) {}

    private record LessonRow(VocabularyItem.Source source, Candidate candidate) {}

    /**
     * Bài từ vựng đang học dở (bài gần nhất có hoạt động mà chưa đánh dấu hoàn thành) và chủ điểm ngữ pháp
     * gần nhất chưa thành thạo. "Hoạt động" của bài từ vựng gồm cả hoàn thành một chế độ (lesson_progress)
     * lẫn ôn/luyện một từ của bài (user_vocabulary) - nhiều người luyện mà không làm trọn chế độ nào.
     */
    private List<DashboardResponse.ContinueItem> continueLearning(User user) {
        List<Candidate> candidates = new ArrayList<>();

        List<LessonRow> lessons = jdbc.query("""
            WITH activity AS (
                SELECT lp.lesson_id, lp.completed_at AS at FROM lesson_progress lp WHERE lp.user_id = ?
                UNION ALL
                SELECT v.lesson_id, COALESCE(uv.last_reviewed_at, uv.created_at)
                  FROM user_vocabulary uv JOIN vocabulary_items v ON v.id = uv.vocabulary_item_id
                 WHERE uv.user_id = ? AND v.lesson_id IS NOT NULL
            )
            SELECT l.id, l.title, l.source, l.level, max(a.at) AS last_at,
                   (SELECT count(DISTINCT p.mode) FROM lesson_progress p
                     WHERE p.user_id = ? AND p.lesson_id = l.id AND p.mode <> 'LESSON_COMPLETE') AS modes_done
              FROM activity a JOIN lessons l ON l.id = a.lesson_id
             WHERE NOT EXISTS (SELECT 1 FROM lesson_progress c
                                WHERE c.user_id = ? AND c.lesson_id = l.id AND c.mode = 'LESSON_COMPLETE')
             GROUP BY l.id, l.title, l.source, l.level
             ORDER BY last_at DESC
             LIMIT 5
            """,
            (rs, i) -> new LessonRow(
                VocabularyItem.Source.valueOf(rs.getString("source")),
                new Candidate(
                    new DashboardResponse.ContinueItem(
                        "LESSON",
                        rs.getString("title"),
                        rs.getString("level"),
                        "/app/practice/" + rs.getLong("id"),
                        rs.getInt("modes_done"),
                        LESSON_MODES),
                    rs.getTimestamp("last_at").toLocalDateTime())),
            user.getId(), user.getId(), user.getId(), user.getId());
        // Bài thuộc nguồn đang ẩn với người học (VocabularyVisibility) thì bỏ qua, lấy bài kế tiếp.
        lessons.stream()
            .filter(row -> !visibility.isHidden(row.source()))
            .findFirst()
            .ifPresent(row -> candidates.add(row.candidate()));

        jdbc.query("""
            SELECT t.slug, t.title_vi, t.level, p.correct_count, p.total_count, p.last_practiced_at
              FROM user_grammar_progress p JOIN grammar_topics t ON t.id = p.topic_id
             WHERE p.user_id = ? AND p.status <> 'MASTERED' AND p.last_practiced_at IS NOT NULL
             ORDER BY p.last_practiced_at DESC
             LIMIT 1
            """,
            rs -> {
                candidates.add(new Candidate(
                    new DashboardResponse.ContinueItem(
                        "GRAMMAR", rs.getString("title_vi"), rs.getString("level"),
                        "/app/grammar/" + rs.getString("slug"),
                        rs.getInt("correct_count"), rs.getInt("total_count")),
                    rs.getTimestamp("last_practiced_at").toLocalDateTime()));
            },
            user.getId());

        return candidates.stream()
            .sorted(Comparator.comparing(Candidate::at).reversed())
            .map(Candidate::item)
            .toList();
    }

    /** Đã ôn lại một từ vào một ngày sau ngày gặp nó lần đầu - tức là đã trải qua một vòng lặp lại ngắt quãng. */
    private boolean reviewedOnLaterDay(User user) {
        Boolean found = jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM user_vocabulary WHERE user_id = ? AND last_reviewed_at::date > created_at::date)",
            Boolean.class, user.getId());
        return Boolean.TRUE.equals(found);
    }
}
