package com.deutschpfad.backend.grammar;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WeakVerbConjugatorTest {

    @Test
    void regularVerb_conjugatesAllSixPersons() {
        assertThat(WeakVerbConjugator.conjugate("lernen", WeakVerbConjugator.Person.ICH)).isEqualTo("lerne");
        assertThat(WeakVerbConjugator.conjugate("lernen", WeakVerbConjugator.Person.DU)).isEqualTo("lernst");
        assertThat(WeakVerbConjugator.conjugate("lernen", WeakVerbConjugator.Person.ER)).isEqualTo("lernt");
        assertThat(WeakVerbConjugator.conjugate("lernen", WeakVerbConjugator.Person.WIR)).isEqualTo("lernen");
        assertThat(WeakVerbConjugator.conjugate("lernen", WeakVerbConjugator.Person.IHR)).isEqualTo("lernt");
        assertThat(WeakVerbConjugator.conjugate("lernen", WeakVerbConjugator.Person.SIE)).isEqualTo("lernen");
    }

    @Test
    void stemEndingInTOrD_getsEpentheticE() {
        assertThat(WeakVerbConjugator.conjugate("arbeiten", WeakVerbConjugator.Person.DU)).isEqualTo("arbeitest");
        assertThat(WeakVerbConjugator.conjugate("arbeiten", WeakVerbConjugator.Person.ER)).isEqualTo("arbeitet");
        assertThat(WeakVerbConjugator.conjugate("reden", WeakVerbConjugator.Person.DU)).isEqualTo("redest");
        assertThat(WeakVerbConjugator.conjugate("reden", WeakVerbConjugator.Person.IHR)).isEqualTo("redet");
    }

    @Test
    void consonantBeforeNasal_getsEpentheticE_butLRMNH_doesNot() {
        assertThat(WeakVerbConjugator.conjugate("atmen", WeakVerbConjugator.Person.DU)).isEqualTo("atmest");
        assertThat(WeakVerbConjugator.conjugate("öffnen", WeakVerbConjugator.Person.DU)).isEqualTo("öffnest");
        // thân "lern" kết thúc bằng n nhưng đứng trước là r -> KHÔNG chèn e
        assertThat(WeakVerbConjugator.conjugate("lernen", WeakVerbConjugator.Person.DU)).isEqualTo("lernst");
    }

    @Test
    void hBeforeNasal_dependsOnWhetherTheHIsSilent() {
        // "wohn": h chỉ kéo dài nguyên âm o -> h câm -> KHÔNG chèn e
        assertThat(WeakVerbConjugator.conjugate("wohnen", WeakVerbConjugator.Person.DU)).isEqualTo("wohnst");
        // "rechn"/"zeichn": h thuộc cụm phụ âm "ch" -> CÓ chèn e
        assertThat(WeakVerbConjugator.conjugate("rechnen", WeakVerbConjugator.Person.DU)).isEqualTo("rechnest");
        assertThat(WeakVerbConjugator.conjugate("zeichnen", WeakVerbConjugator.Person.ER)).isEqualTo("zeichnet");
    }

    @Test
    void stemEndingInSibilant_duTakesOnlyT() {
        assertThat(WeakVerbConjugator.conjugate("tanzen", WeakVerbConjugator.Person.DU)).isEqualTo("tanzt");
        assertThat(WeakVerbConjugator.conjugate("reisen", WeakVerbConjugator.Person.DU)).isEqualTo("reist");
    }

    @Test
    void strongAndIrregularVerbs_areRejected() {
        for (String verb : new String[] {"fahren", "sein", "haben", "können", "sprechen", "nehmen", "lesen"}) {
            assertThat(WeakVerbConjugator.isRegularAndSeparable(verb)).as(verb).isFalse();
        }
    }

    @Test
    void prefixedFormsOfStrongVerbs_areRejectedToo() {
        // Khớp theo đuôi nên bắt được cả từ có tiền tố, không phải liệt kê từng biến thể.
        assertThat(WeakVerbConjugator.isRegularAndSeparable("verstehen")).isFalse();
        assertThat(WeakVerbConjugator.isRegularAndSeparable("anfangen")).isFalse();
        assertThat(WeakVerbConjugator.isRegularAndSeparable("bekommen")).isFalse();
    }

    @Test
    void separableVerbs_areRejected_becauseConjugatedFormIsNotOneWord() {
        assertThat(WeakVerbConjugator.isRegularAndSeparable("aufwachen")).isFalse();
        assertThat(WeakVerbConjugator.isRegularAndSeparable("einkaufen")).isFalse();
        // darstellen -> "ich stelle dar"
        assertThat(WeakVerbConjugator.isRegularAndSeparable("darstellen")).isFalse();
        assertThat(WeakVerbConjugator.isRegularAndSeparable("wahrnehmen")).isFalse();
    }

    @Test
    void wiederholen_staysAccepted_becauseItIsInseparable() {
        // Không chặn tiền tố "wieder" là lựa chọn có chủ ý — xem ghi chú trong SEPARABLE_PREFIXES.
        assertThat(WeakVerbConjugator.isRegularAndSeparable("wiederholen")).isTrue();
        assertThat(WeakVerbConjugator.conjugate("wiederholen", WeakVerbConjugator.Person.DU))
            .isEqualTo("wiederholst");
    }

    @Test
    void elnAndErnVerbs_areRejected_becauseTheyDropTheStemE() {
        // sammeln -> ich sammle (mất chữ e của -el), quy tắc riêng nên không nhận.
        assertThat(WeakVerbConjugator.isRegularAndSeparable("sammeln")).isFalse();
        assertThat(WeakVerbConjugator.isRegularAndSeparable("ändern")).isFalse();
    }

    @Test
    void reflexiveEntries_areRejected_becauseThePronounMovesWhenConjugated() {
        // Từ điển lưu "sich duschen"; chia ra là "ich dusche mich" -> không điền được vào 1 ô.
        assertThat(WeakVerbConjugator.isRegularAndSeparable("sich duschen")).isFalse();
        assertThat(WeakVerbConjugator.isRegularAndSeparable("sich vorstellen")).isFalse();
    }

    @Test
    void verbVerbCompounds_areRejected() {
        // "kennenlernen" -> "ich lerne dich kennen", phần đầu tách ra như tiền tố.
        assertThat(WeakVerbConjugator.isRegularAndSeparable("kennenlernen")).isFalse();
        assertThat(WeakVerbConjugator.isRegularAndSeparable("spazierengehen")).isFalse();
    }

    @Test
    void plainWeakVerbs_areAccepted() {
        for (String verb : new String[] {"lernen", "arbeiten", "wohnen", "spielen", "kaufen", "machen"}) {
            assertThat(WeakVerbConjugator.isRegularAndSeparable(verb)).as(verb).isTrue();
        }
    }
}
