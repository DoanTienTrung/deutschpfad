package com.deutschpfad.backend.translation;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TranslationCheckerTest {

    private static final List<String> ACCEPTED = List.of("Heute arbeite ich zu Hause.", "Ich arbeite heute zu Hause.");

    @Test
    void khopCauMau_hoacCachDichKhac_thiDung_khongTinhDauCuoiCauVaKhoangTrang() {
        assertThat(TranslationChecker.check("Heute arbeite ich zu Hause.", ACCEPTED).verdict())
            .isEqualTo(TranslationAttempt.Verdict.CORRECT);
        assertThat(TranslationChecker.check("  Ich arbeite  heute zu Hause ", ACCEPTED).verdict())
            .isEqualTo(TranslationAttempt.Verdict.CORRECT);
        assertThat(TranslationChecker.check("Ich arbeite heute zu Hause!", ACCEPTED).feedback().corrected())
            .isEqualTo("Ich arbeite heute zu Hause.");
    }

    @Test
    void sai_vietHoa_thiGanDung_chiRaTuSai() {
        TranslationChecker.Result r = TranslationChecker.check("heute arbeite ich zu hause", ACCEPTED);

        assertThat(r.verdict()).isEqualTo(TranslationAttempt.Verdict.ALMOST);
        assertThat(r.feedback().errors()).extracting(TranslationChecker.ErrorNote::wrong).containsExactly("heute", "hause");
        assertThat(r.feedback().errors().get(1).explain()).contains("Danh từ");
    }

    @Test
    void thieuDauPhayTruocWeil_thiGanDung() {
        TranslationChecker.Result r = TranslationChecker.check(
            "Ich bleibe zu Hause weil ich krank bin", List.of("Ich bleibe zu Hause, weil ich krank bin."));

        assertThat(r.verdict()).isEqualTo(TranslationAttempt.Verdict.ALMOST);
        assertThat(r.feedback().errors()).singleElement().satisfies(e -> assertThat(e.explain()).contains("Dấu phẩy"));
    }

    @Test
    void goAeOeUeSs_thiGanDung_nhacDungUmlaut() {
        TranslationChecker.Result r = TranslationChecker.check("Er faehrt mit dem Bus", List.of("Er fährt mit dem Bus."));

        assertThat(r.verdict()).isEqualTo(TranslationAttempt.Verdict.ALMOST);
        assertThat(r.feedback().errors()).singleElement().satisfies(e -> {
            assertThat(e.wrong()).isEqualTo("faehrt");
            assertThat(e.right()).isEqualTo("fährt");
        });
    }

    @Test
    void khacTu_thiKhongKetLuan_deAIXet() {
        assertThat(TranslationChecker.check("Ich arbeite heute im Büro", ACCEPTED)).isNull();
        assertThat(TranslationChecker.check("   ", ACCEPTED)).isNull();
    }

    @Test
    void chuanHoa_dauNhayVaKhoangTrangTruocDauCau() {
        assertThat(TranslationChecker.normalize("Wie geht’s dir , Anna ?")).isEqualTo("Wie geht's dir, Anna");
    }
}
