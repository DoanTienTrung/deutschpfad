package com.deutschpfad.backend.vocabulary;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class NounPluralTest {

    // Các kiểu ký hiệu lấy từ dữ liệu giáo trình thật (1.736 từ). Chạy trên toàn bộ: 817/818 danh
    // từ có ký hiệu đọc được; 756 khớp Wiktionary, 10 khác — 9 là biến thể đều đúng
    // (Balkone/Balkons, Pizzen/Pizzas), 1 là lỗi dữ liệu "die Maske, -en" (xem test bên dưới).
    @ParameterizedTest(name = "\"{0}\" → {1}")
    @CsvSource(delimiter = '|', value = {
        "das Bild, -er                                  | Bilder",
        "die Frage, -n                                  | Fragen",
        "die Schwägerin, -nen                           | Schwägerinnen",
        "der Bus, -se                                   | Busse",
        "der Titel, -                                   | Titel",
        "die Mutter, ¨                                  | Mütter",
        "die Mutter, =                                  | Mütter",
        "der Apfel, ¨                                   | Äpfel",
        "das Buch, ¨er                                  | Bücher",
        "der Sohn, =e                                   | Söhne",
        "das Kaufhaus, ¨er                              | Kaufhäuser",
        "die Werkstatt, =en                             | Werkstätten",
        "der Fußboden, ¨                                | Fußböden",
        "die Firma, Firmen                              | Firmen",
        "das Stadtzentrum, -zentren                     | Stadtzentren",
        "der Hotelfachmann, -leute/die Hotelfachfrau, -en | Hotelfachleute",
        "der Fahrer, -/die Fahrerin, -nen               | Fahrer",
        "der/die Deutsche, -n                           | Deutschen",
        "der (Regen-)Schirm, -e                         | Regenschirme",
        "der Quadratmeter (m²/qm), -                    | Quadratmeter",
    })
    void docKyHieuSoNhieu(String germanWord, String plural) {
        assertThat(NounPlural.fromNotation(germanWord)).contains(plural);
    }

    @ParameterizedTest(name = "\"{0}\" → không có")
    @ValueSource(strings = {
        "das Auto",          // không có ký hiệu → để nguồn khác lo
        "die Musik (Sg.)",
        "sein, -e",          // không phải danh từ: "-e" là đuôi biến cách
        "das Ding, ?",       // ký hiệu lạ → không đoán
        "die Maske, -en",    // lỗi dữ liệu thật — sẽ ra "Maskeen"
        "",
    })
    void khongDocDuoc_thiDeTrong(String germanWord) {
        assertThat(NounPlural.fromNotation(germanWord)).isEmpty();
    }

    @Test
    void umlautBoQuaNguyenAmDoiDaBienAm() {
        assertThat(NounPlural.umlaut("Haus")).isEqualTo("Häus");
        assertThat(NounPlural.umlaut("Freund")).as("eu không biến âm").isNull();
    }

    private static final Map<String, String> WIKTIONARY = Map.of(
        "Auto\tn", "Autos",
        "Alphabet\tn", "Alphabete"
        // "Mutter" và "Bank" cố ý không có — giống bảng thật (mỗi từ có hai số nhiều).
    );

    private static List<String> resolve(String... words) {
        return NounPlural.resolveFamily(Arrays.asList(words), (lemma, genus) -> WIKTIONARY.get(lemma + "\t" + genus));
    }

    @Test
    void dongKhongKyHieu_dungKyHieuCuaDongCungTu() {
        // Bảng Wiktionary không có "Mutter" — chỉ dòng giáo trình mới cho biết là "Mütter".
        assertThat(resolve("die Mutter", "die Mutter, ¨")).containsExactly("Mütter", "Mütter");
    }

    @Test
    void khongCoKyHieuNao_thiTraBangWiktionary() {
        assertThat(resolve("das Auto")).containsExactly("Autos");
        assertThat(resolve("die Mutter")).containsExactly((String) null);
    }

    @Test
    void danhDauChiSoIt_thiCaNhomKhongCoSoNhieu() {
        // Wiktionary có "Alphabete", nhưng giáo trình đã quyết với người học A1 là từ chỉ số ít.
        assertThat(resolve("das Alphabet", "das Alphabet (Sg.)")).containsExactly(null, null);
    }

    @Test
    void haiKyHieuMauThuan_thiKhongChiaSeChoDongKhac() {
        assertThat(resolve("die Bank", "die Bank, ¨e", "die Bank, -en")).containsExactly(null, "Bänke", "Banken");
    }
}
