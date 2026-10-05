package com.deutschpfad.backend.translation;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TranslationAiPromptsTest {

    @Test
    void docJsonCham_kemChuThuaHaiDau() {
        String text = """
            Đây là kết quả:
            ```json
            {"verdict":"almost","corrected":"Ich habe gestern Reis gekocht.","errors":[{"wrong":"hat","right":"habe","explain":"Chủ ngữ ich đi với habe."},{"wrong":"","right":"","explain":""}],"note":"Gần đúng rồi!"}
            ```
            """;

        TranslationAiPrompts.Judgment j = TranslationAiPrompts.parseJudgment(text);

        assertThat(j.verdict()).isEqualTo(TranslationAttempt.Verdict.ALMOST);
        assertThat(j.feedback().corrected()).isEqualTo("Ich habe gestern Reis gekocht.");
        assertThat(j.feedback().errors()).as("bỏ lỗi không có giải thích").singleElement()
            .satisfies(e -> assertThat(e.right()).isEqualTo("habe"));
        assertThat(j.feedback().note()).isEqualTo("Gần đúng rồi!");
    }

    @Test
    void jsonHongHoacVerdictLa_thiNull() {
        assertThat(TranslationAiPrompts.parseJudgment("Tôi không chắc")).isNull();
        assertThat(TranslationAiPrompts.parseJudgment("{\"verdict\":\"MAYBE\"}")).isNull();
        assertThat(TranslationAiPrompts.parseJudgment("{\"verdict\": CORRECT")).isNull();
        assertThat(TranslationAiPrompts.parseJudgment(null)).isNull();
    }

    @Test
    void docNhapCau_congThucVaCacDong() {
        String text = """
            CÔNG THỨC: haben/sein + Partizip II cuối câu
            1. Hôm qua tôi nấu cơm. ||| Gestern habe ich Reis gekocht. ||| Ich habe gestern Reis gekocht. ;; Gestern habe ich Reis gekocht. ||| kochen, der Reis
            2) Bạn ngủ ngon không? ||| Hast du gut geschlafen? ||| - ||| schlafen
            dòng rác không đúng định dạng
            3. Thiếu câu Đức |||
            """;

        TranslationAiPrompts.Draft d = TranslationAiPrompts.parseDraft(text);

        assertThat(d.structureNote()).isEqualTo("haben/sein + Partizip II cuối câu");
        assertThat(d.items()).hasSize(2);
        assertThat(d.items().get(0).alternatives()).as("bỏ bản trùng câu chính").containsExactly("Ich habe gestern Reis gekocht.");
        assertThat(d.items().get(1).alternatives()).isEmpty();
        assertThat(d.items().get(1).keywords()).isEqualTo("schlafen");
    }
}
