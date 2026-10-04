package com.deutschpfad.backend.dashboard;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.vocabulary.Lesson;
import com.deutschpfad.backend.vocabulary.LessonRepository;
import com.deutschpfad.backend.vocabulary.LearningStreak;
import com.deutschpfad.backend.vocabulary.StreakResponse;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import com.deutschpfad.backend.vocabulary.VocabularyItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class DashboardServiceTest {

    @Autowired private DashboardService dashboardService;
    @Autowired private UserRepository userRepository;
    @Autowired private VocabularyItemRepository itemRepository;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private JdbcTemplate jdbc;

    private final LocalDate today = LocalDate.now();

    @Test
    void mucDoThuoc_bonNhomKhongChongNhau_vaDuBaoDonTheQuaHanVaoHomNay() {
        User user = user();
        card(user, "das Haus", 0, 0, today.minusDays(3), LocalDateTime.now());    // quá hạn → hôm nay, chưa nhớ
        card(user, "der Hund", 1, 1, today, LocalDateTime.now());                  // hôm nay, đang học
        card(user, "die Katze", 2, 6, today.plusDays(2), LocalDateTime.now());     // +2, đã thuộc
        card(user, "das Buch", 5, 40, today.plusDays(30), LocalDateTime.now().minusDays(20)); // ngoài 7 ngày, nhớ lâu

        DashboardResponse d = dashboardService.build(user);

        assertThat(d.vocabulary().total()).isEqualTo(4);
        assertThat(d.vocabulary().notYet()).isEqualTo(1);
        assertThat(d.vocabulary().learning()).isEqualTo(1);
        assertThat(d.vocabulary().known()).isEqualTo(1);
        assertThat(d.vocabulary().longTerm()).isEqualTo(1);
        assertThat(d.vocabulary().newThisWeek()).as("thẻ tạo 20 ngày trước không tính").isEqualTo(3);
        assertThat(d.vocabulary().dueToday()).isEqualTo(2);

        assertThat(d.reviewForecast()).hasSize(7);
        assertThat(d.reviewForecast().get(0).value()).as("quá hạn dồn vào hôm nay").isEqualTo(2);
        assertThat(d.reviewForecast().get(2).value()).isEqualTo(1);
        assertThat(d.reviewForecast().stream().mapToLong(DashboardResponse.DayCount::value).sum())
            .as("thẻ hẹn sau 30 ngày không nằm trong 7 ngày tới").isEqualTo(3);
    }

    @Test
    void thoiGianHoc_14Ngay_tachTuanNayVaTuanTruoc() {
        User user = user();
        study(user, today, 600);
        study(user, today.minusDays(6), 300);   // vẫn là tuần này (7 ngày gần nhất)
        study(user, today.minusDays(7), 120);   // tuần trước
        study(user, today.minusDays(20), 999);  // ngoài 14 ngày

        DashboardResponse.StudyTime t = dashboardService.build(user).studyTime();

        assertThat(t.last14Days()).hasSize(14);
        assertThat(t.last14Days().get(13).date()).isEqualTo(today);
        assertThat(t.last14Days().get(13).value()).isEqualTo(600);
        assertThat(t.thisWeekSeconds()).isEqualTo(900);
        assertThat(t.lastWeekSeconds()).isEqualTo(120);
    }

    @Test
    void hocTiep_baiGanNhatChuaHoanThanh_boQuaBaiDaXongVaNguonDangAn() {
        User user = user();
        // Nguồn FREQUENCY: bài LIFE do V72 nạp sẵn, thêm bài LIFE ở đây sẽ làm lệch LifeInGermanySeedTest (chung DB).
        Lesson done = lesson("Bài đã xong", VocabularyItem.Source.FREQUENCY);
        Lesson hidden = lesson("Bài giáo trình (ẩn)", VocabularyItem.Source.TEXTBOOK);
        Lesson open = lesson("Bài đang học (kiểm thử)", VocabularyItem.Source.FREQUENCY);
        progress(user, open, "FLASHCARD", LocalDateTime.now().minusHours(3));
        progress(user, open, "MULTIPLE_CHOICE", LocalDateTime.now().minusHours(2));
        progress(user, done, "LESSON_COMPLETE", LocalDateTime.now().minusMinutes(30));
        progress(user, hidden, "FLASHCARD", LocalDateTime.now().minusMinutes(10));

        var items = dashboardService.build(user).continueLearning();

        assertThat(items).hasSize(1);
        assertThat(items.get(0).title()).isEqualTo("Bài đang học (kiểm thử)");
        assertThat(items.get(0).progress()).isEqualTo(2);
        assertThat(items.get(0).progressTotal()).isEqualTo(6);
    }

    @Test
    void lamQuen_buocOnLaiChiXongKhiOnVaoNgaySauNgayGap() {
        User user = user();
        card(user, "der Tisch", 1, 1, today.plusDays(1), LocalDateTime.now());
        jdbc.update("UPDATE user_vocabulary SET last_reviewed_at = now() WHERE user_id = ?", user.getId());
        assertThat(dashboardService.build(user).onboarding().learnedFirstWords()).isTrue();
        assertThat(dashboardService.build(user).onboarding().reviewedOnLaterDay()).isFalse();

        jdbc.update("UPDATE user_vocabulary SET created_at = now() - interval '2 days' WHERE user_id = ?", user.getId());
        assertThat(dashboardService.build(user).onboarding().reviewedOnLaterDay()).isTrue();
    }

    @Test
    void chuoiDaDut_hien0_conKyLucGiuNguyen() {
        LearningStreak s = new LearningStreak();
        s.setCurrentStreak(9);
        s.setLongestStreak(12);
        s.setLastActiveDate(today.minusDays(2));
        assertThat(StreakResponse.from(s).currentStreak()).isZero();
        assertThat(StreakResponse.from(s).longestStreak()).isEqualTo(12);

        s.setLastActiveDate(today.minusDays(1));
        assertThat(StreakResponse.from(s).currentStreak()).as("hôm qua có học: chuỗi vẫn còn").isEqualTo(9);
    }

    // ------------------------------------------------------------------------------------------

    private User user() {
        User user = new User();
        user.setEmail("dash-" + UUID.randomUUID() + "@example.com");
        user.setPasswordHash("khong-dung-toi");
        user.setFullName("Người Test");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private void card(User user, String word, int reps, int interval, LocalDate next, LocalDateTime created) {
        VocabularyItem item = new VocabularyItem();
        item.setGermanWord(word + " " + UUID.randomUUID().toString().substring(0, 6));
        item.setVietnameseMeaning("(kiểm thử)");
        item.setLevel(VocabularyItem.Level.A1);
        item = itemRepository.save(item);
        jdbc.update("""
            INSERT INTO user_vocabulary (user_id, vocabulary_item_id, word_key, repetitions, interval_days, next_review_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            user.getId(), item.getId(), item.getWordKey(), reps, interval, Date.valueOf(next), Timestamp.valueOf(created));
    }

    private void study(User user, LocalDate date, int seconds) {
        jdbc.update("INSERT INTO study_time_daily (user_id, study_date, seconds) VALUES (?, ?, ?)", user.getId(), Date.valueOf(date), seconds);
    }

    private Lesson lesson(String title, VocabularyItem.Source source) {
        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setLevel(VocabularyItem.Level.A2);
        lesson.setSource(source);
        lesson.setOrderIndex(99);
        return lessonRepository.save(lesson);
    }

    private void progress(User user, Lesson lesson, String mode, LocalDateTime at) {
        jdbc.update("INSERT INTO lesson_progress (user_id, lesson_id, mode, completed_at) VALUES (?, ?, ?, ?)",
            user.getId(), lesson.getId(), mode, Timestamp.valueOf(at));
    }
}
