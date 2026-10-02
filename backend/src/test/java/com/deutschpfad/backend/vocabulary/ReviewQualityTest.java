package com.deutschpfad.backend.vocabulary;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class ReviewQualityTest {

    private static final double START_EASE = 2.5;

    @Test
    void bamNho_khongLamThayDoiHeSoDe() {
        // Trước đây "Nhớ" = q3 → mỗi lần bấm trừ 0,14 vào hệ số dễ.
        Sm2Calculator.Result result = Sm2Calculator.calculate(
            2, START_EASE, 6, ReviewQuality.REMEMBERED.getQuality()
        );
        assertThat(result.easeFactor()).isCloseTo(START_EASE, within(1e-9));
    }

    @Test
    void bamNhoMuoiLanLienTiep_heSoDeKhongTutVeSan() {
        // Kịch bản thật của lỗi: một từ người học lần nào cũng nhớ, lần nào cũng bấm "Nhớ".
        int repetitions = 0;
        double ease = START_EASE;
        int interval = 0;
        for (int i = 0; i < 10; i++) {
            Sm2Calculator.Result r = Sm2Calculator.calculate(
                repetitions, ease, interval, ReviewQuality.REMEMBERED.getQuality()
            );
            repetitions = r.repetitions();
            ease = r.easeFactor();
            interval = r.intervalDays();
        }
        assertThat(ease).isCloseTo(START_EASE, within(1e-9));
        // Với q3 cũ, lần ôn thứ 5 chỉ cách 52 ngày; q4 phải đạt ít nhất 95.
        assertThat(interval).isGreaterThan(1000);
    }

    @Test
    void bamDe_tangHeSo_bamQuen_giamHeSo() {
        assertThat(Sm2Calculator.calculate(2, START_EASE, 6, ReviewQuality.EASY.getQuality()).easeFactor())
            .isGreaterThan(START_EASE);
        assertThat(Sm2Calculator.calculate(2, START_EASE, 6, ReviewQuality.FORGOT.getQuality()).easeFactor())
            .isLessThan(START_EASE);
    }
}
