package com.deutschpfad.backend.vocabulary;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WordKeyTest {

    @ParameterizedTest(name = "\"{0}\" và \"{1}\" là cùng một từ")
    @CsvSource(delimiter = '|', value = {
        // Cùng từ ở nguồn tần suất (ghi gọn) và nguồn giáo trình (ghi kiểu từ điển)
        "die Mutter                               | die Mutter, ¨",
        "das Bild                                 | das Bild, -er",
        "der Polizist                             | der Polizist, -en/die Polizistin, -nen",
        "die Musik                                | die Musik (Sg.)",
        "zeigen                                   | zeigen (gezeigt)",
        "abfahren                                 | ab-fahren (abgefahren)",
        "der Quadratmeter                         | der Quadratmeter (m²/qm), -",
        "Die Mutter                               | die Mutter",
    })
    void cungMotTu_cungKhoa(String a, String b) {
        assertThat(WordKey.of(a)).isEqualTo(WordKey.of(b));
    }

    @ParameterizedTest(name = "\"{0}\" và \"{1}\" là HAI từ khác nhau")
    @CsvSource(delimiter = '|', value = {
        "der See    | die See",    // hồ  ≠  biển: mạo từ là một phần của từ
        "schon      | schön",      // đã  ≠  đẹp: Umlaut là một phần của từ
        "der Bar    | der Bär",
        "zahlen     | zählen",
        "Mutter     | die Mutter", // thà không gộp còn hơn đoán mạo từ
        // Ba nhóm gộp nhầm mà bản đầu của WordKey mắc phải — tìm ra khi chạy trên dữ liệu thật:
        "Sie              | sie (Singular)",  // Ngài  ≠  cô ấy: chữ hoa phân biệt nghĩa
        "sie (Singular)   | sie (Plural)",    // cô ấy  ≠  họ: chú thích viết hoa phân biệt nghĩa
        "sein             | sein, -e",        // là (động từ)  ≠  của anh ấy: ", -e" KHÔNG phải số nhiều
        "Ihr-             | ihr",             // của Ngài  ≠  các bạn
        "ihr              | ihr, -e",         // các bạn  ≠  của cô ấy
    })
    void haiTuKhacNhau_khacKhoa(String a, String b) {
        assertThat(WordKey.of(a)).isNotEqualTo(WordKey.of(b));
    }

    @Test
    void cacKieuGhiDacBiet() {
        assertThat(WordKey.of("der/die Angestellte, -n")).isEqualTo("der angestellte");
        assertThat(WordKey.of("das Kilo(gramm) (kg) (Sg.)")).isEqualTo("das kilogramm");
        assertThat(WordKey.of("der (Regen-)Schirm, -e")).isEqualTo("der regenschirm");
        // Không phải danh từ (không có mạo từ) → giữ nguyên chú thích không phải chữ thường.
        assertThat(WordKey.of("Senioren (Pl.): Senioren-")).isEqualTo("Senioren (Pl.)");
        assertThat(WordKey.of("verbinden (mit) (verbunden)")).isEqualTo("verbinden");
        assertThat(WordKey.of(null)).isEmpty();
    }
}
