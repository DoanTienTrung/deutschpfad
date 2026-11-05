package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/** Bài luyện dịch theo ngữ pháp nạp ở V77 (A1-A2) và V79 (phần còn lại của A1, B1, B2). */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class GrammarTranslationSeedTest {

    @Autowired private JdbcTemplate jdbc;

    @Test
    void moiChuDiemNguPhap_coDungMotBaiDich10Cau_daXuatBan() {
        List<Map<String, Object>> missing = jdbc.queryForList(
            "SELECT g.slug FROM grammar_topics g LEFT JOIN translation_sets s ON s.grammar_topic_id = g.id WHERE s.id IS NULL");
        assertThat(missing).isEmpty();

        assertThat(jdbc.queryForList(
            "SELECT s.id FROM translation_sets s WHERE s.type = 'GRAMMAR' AND (s.status <> 'PUBLISHED' "
                + "OR (SELECT count(*) FROM translation_items i WHERE i.set_id = s.id) <> 10)")).isEmpty();
        assertThat(jdbc.queryForObject(
            "SELECT count(*) FROM translation_sets WHERE type = 'GRAMMAR' AND level IN ('B1', 'B2')", Integer.class))
            .isEqualTo(36);
    }

    @Test
    void cauMauVaCachDichKhac_deuDuocChamDungTaiCho() {
        List<String> notCorrect = new ArrayList<>();
        jdbc.query("SELECT de_reference, accepted_answers FROM translation_items", rs -> {
            List<String> accepted = new ArrayList<>(List.of(rs.getString("de_reference")));
            String alternatives = rs.getString("accepted_answers");
            if (alternatives != null) accepted.addAll(List.of(alternatives.split("\n")));
            for (String answer : accepted) {
                if (TranslationChecker.check(answer, accepted).verdict() != TranslationAttempt.Verdict.CORRECT) {
                    notCorrect.add(answer);
                }
            }
        });
        assertThat(notCorrect).isEmpty();
    }
}
