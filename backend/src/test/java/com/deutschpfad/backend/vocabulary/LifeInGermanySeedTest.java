package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Bộ từ "Sống ở Đức" nạp ở V72. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class LifeInGermanySeedTest {

    @Autowired private LessonController lessonController;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void tamBai_moiBai25Tu_khongLotVaoLoTrinhCapDo() {
        List<LessonSummaryResponse> lessons = lessonController.list(null, null, VocabularyItem.Source.LIFE);
        assertThat(lessons).hasSize(8);
        assertThat(lessons).allSatisfy(l -> assertThat(l.wordCount()).isEqualTo(25));
        assertThat(lessons.get(0).title()).isEqualTo("Đăng ký cư trú và giấy tờ");

        // Danh sách "Theo cấp độ" lọc theo nguồn tần suất — không được lẫn bài "Sống ở Đức".
        assertThat(lessonController.list(VocabularyItem.Level.A2, null, VocabularyItem.Source.FREQUENCY))
            .noneMatch(l -> l.title().equals("Thuê nhà"));
    }

    @Test
    void moiTuDuSoNhieu_banDich_vaChoGachChanNamTrongCau() {
        assertThat(jdbc.queryForObject("SELECT plural FROM vocabulary_items WHERE german_word = 'die Miete, -n'", String.class))
            .isEqualTo("Mieten");
        assertThat(jdbc.queryForObject("SELECT plural FROM vocabulary_items WHERE german_word = 'der Strom (Sg.)'", String.class))
            .isNull();
        assertThat(jdbc.queryForObject(
            "SELECT count(*) FROM vocabulary_items WHERE source = 'LIFE' AND (example_sentence_vi IS NULL "
                + "OR position(lower(example_sentence_highlight) IN lower(example_sentence)) = 0 OR word_key = '')",
            Integer.class)).isZero();
    }
}
