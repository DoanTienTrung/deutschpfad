package com.deutschpfad.backend.grammar;

import java.util.List;
import java.util.Set;

/**
 * Chia động từ <b>yếu (regelmäßig)</b> ở thì Präsens theo quy tắc. Logic thuần, không đụng DB/AI
 * để unit test được.
 *
 * <p>Nguyên tắc thiết kế: bài tập sinh từ đây được đánh dấu duyệt sẵn, nên <b>thà bỏ sót còn hơn
 * sinh sai</b>. Mọi động từ không chắc chắn là yếu và không tách được đều bị loại thẳng
 * ({@link #isRegularAndSeparable}) — loại nhầm chỉ làm ít bài đi, không bao giờ tạo ra đáp án sai.
 */
final class WeakVerbConjugator {

    private WeakVerbConjugator() {}

    /** 6 ngôi ở Präsens, kèm nhãn hiển thị cho đề bài. */
    enum Person {
        ICH("ich"), DU("du"), ER("er/sie/es"), WIR("wir"), IHR("ihr"), SIE("sie/Sie");

        final String label;

        Person(String label) {
            this.label = label;
        }
    }

    /**
     * Động từ mạnh/bất quy tắc — đổi nguyên âm thân từ ở ngôi du/er (fahren → du fährst) hoặc chia
     * hoàn toàn bất quy tắc (sein, haben, modal verbs). Quy tắc thân + đuôi bên dưới KHÔNG áp dụng
     * được, nên loại thẳng. So khớp theo <b>đuôi</b> để bắt luôn các từ có tiền tố:
     * "verstehen"/"anfangen" cũng bị loại nhờ khớp "stehen"/"fangen".
     */
    private static final Set<String> STRONG_VERB_STEMS = Set.of(
        "backen", "befehlen", "beginnen", "beißen", "bergen", "bersten", "biegen", "bieten",
        "binden", "bitten", "blasen", "bleiben", "braten", "brechen", "brennen", "bringen",
        "denken", "dringen", "dürfen", "empfehlen", "essen", "fahren", "fallen", "fangen",
        "finden", "fliegen", "fliehen", "fließen", "fressen", "frieren", "geben", "gehen",
        "gelingen", "gelten", "genesen", "genießen", "geschehen", "gewinnen", "gießen",
        "gleichen", "gleiten", "graben", "greifen", "haben", "halten", "hängen", "hauen",
        "heben", "heißen", "helfen", "kennen", "klingen", "kneifen", "kommen", "können",
        "kriechen", "laden", "lassen", "laufen", "leiden", "leihen", "lesen", "liegen", "lügen",
        "meiden", "messen", "mögen", "müssen", "nehmen", "nennen", "pfeifen", "preisen",
        "quellen", "raten", "reiben", "reißen", "reiten", "rennen", "riechen", "ringen",
        "rinnen", "rufen", "saufen", "saugen", "schaffen", "scheiden", "scheinen", "schelten",
        "scheren", "schieben", "schießen", "schlafen", "schlagen", "schleichen", "schleifen",
        "schließen", "schlingen", "schmeißen", "schmelzen", "schneiden", "schreiben", "schreien",
        "schreiten", "schweigen", "schwellen", "schwimmen", "schwinden", "schwingen", "schwören",
        "sehen", "sein", "senden", "singen", "sinken", "sinnen", "sitzen", "sollen", "spinnen",
        "sprechen", "sprießen", "springen", "stechen", "stehen", "stehlen", "steigen", "sterben",
        "stinken", "stoßen", "streichen", "streiten", "tragen", "treffen", "treiben", "treten",
        "trinken", "tun", "verderben", "vergessen", "verlieren", "wachsen", "waschen", "weichen",
        "weisen", "wenden", "werben", "werden", "werfen", "wiegen", "winden", "wissen", "wollen",
        "ziehen", "zwingen"
    );

    /**
     * Tiền tố tách được: "aufwachen" chia thành "ich wache ... auf" — dạng chia không còn là MỘT
     * từ nên không hợp với dạng bài điền một ô. Bốn tiền tố durch/über/um/unter vừa tách được vừa
     * không tuỳ từng từ ("umfahren" có cả 2 nghĩa), phân biệt được chỉ bằng chính tả là không thể
     * — nên loại luôn cho chắc.
     */
    private static final List<String> SEPARABLE_PREFIXES = List.of(
        "ab", "an", "auf", "aus", "bei", "dar", "durch", "ein", "empor", "entgegen", "entlang",
        "fern", "fest", "fort", "frei", "gegenüber", "heim", "her", "hin", "hoch", "los", "mit",
        "nach", "nieder", "statt", "teil", "über", "um", "unter", "vor", "voran", "vorbei",
        "wahr", "weg", "weiter", "zu", "zurecht", "zurück", "zusammen",
        // Cố ý KHÔNG chặn "wieder": các động từ wieder- tách được (wiedersehen, wiederkommen,
        // wiedergeben) đều là động từ mạnh nên đã bị loại ở danh sách trên rồi, trong khi
        // "wiederholen" là động từ yếu không tách — chặn "wieder" chỉ mất từ này mà không
        // ngăn thêm lỗi nào.
        // Ghép động-từ-với-động-từ: phần đầu cũng tách ra như tiền tố ("kennenlernen" →
        // "ich lerne dich kennen"), nên dạng chia không phải một từ. Danh sách ngắn vì kiểu ghép
        // này hiếm, và chính tả hiện hành phần lớn đã tách rời sẵn.
        "kennen", "spazieren", "stehen", "sitzen", "liegen", "bleiben"
    );

    /**
     * Phụ âm vang đứng trước -m/-n thì KHÔNG chèn -e- ("lernen" → du lernst, không "lernest").
     * Chữ h xử lý riêng, xem {@link #needsEpentheticE}.
     */
    private static final Set<Character> NO_E_BEFORE_NASAL = Set.of('l', 'r', 'm', 'n');

    /** true nếu động từ chia được bằng quy tắc yếu và là một từ liền (không tiền tố tách được). */
    static boolean isRegularAndSeparable(String infinitive) {
        if (infinitive == null) return false;
        String verb = infinitive.trim().toLowerCase();

        // Từ điển lưu động từ phản thân kèm đại từ ("sich duschen"). Chia ra thì đại từ đổi theo
        // ngôi và đứng sau động từ ("ich dusche mich"), không phải một từ điền vào một ô — loại.
        // Chặn luôn mọi mục nhiều chữ cho chắc.
        if (verb.contains(" ")) return false;

        // Chỉ nhận đuôi -en. Loại -eln/-ern (sammeln → ich sammle, mất chữ e của -el: quy tắc
        // riêng) và các từ như "tun" vốn đã nằm trong danh sách bất quy tắc.
        if (!verb.endsWith("en") || verb.endsWith("eln") || verb.endsWith("ern")) return false;
        if (verb.length() < 4) return false;

        for (String strong : STRONG_VERB_STEMS) {
            if (verb.endsWith(strong)) return false;
        }
        for (String prefix : SEPARABLE_PREFIXES) {
            if (verb.startsWith(prefix) && verb.length() > prefix.length() + 3) return false;
        }
        return true;
    }

    static String stem(String infinitive) {
        String verb = infinitive.trim().toLowerCase();
        return verb.substring(0, verb.length() - 2);
    }

    /**
     * Chèn -e- trước đuôi -st/-t khi thân từ kết thúc bằng -t/-d ("arbeiten" → du arbeitest), hoặc
     * bằng -m/-n đứng sau một phụ âm ồn ("atmen" → du atmest, "öffnen" → du öffnest), nhưng KHÔNG
     * chèn khi đứng trước là nguyên âm hay phụ âm vang l/r/m/n ("lernen" → du lernst).
     *
     * <p>Chữ h phải xét thêm một bậc nữa, vì cùng là "h + n" nhưng hai kiểu khác hẳn nhau:
     * ở "wohnen" chữ h chỉ là dấu kéo dài nguyên âm (→ du wohnst), còn ở "rechnen" nó thuộc cụm
     * phụ âm "ch" (→ du rechnest). Phân biệt bằng chữ đứng trước h: nguyên âm thì h câm, phụ âm
     * thì h là một phần của cụm.
     */
    static boolean needsEpentheticE(String stem) {
        if (stem.isEmpty()) return false;
        char last = stem.charAt(stem.length() - 1);
        if (last == 't' || last == 'd') return true;
        if ((last == 'm' || last == 'n') && stem.length() >= 2) {
            char before = stem.charAt(stem.length() - 2);
            if (before == 'h') {
                if (stem.length() < 3) return false;
                return !isVowel(stem.charAt(stem.length() - 3));
            }
            return !NO_E_BEFORE_NASAL.contains(before) && !isVowel(before);
        }
        return false;
    }

    /** Thân từ kết thúc bằng âm xuýt thì ngôi du chỉ thêm -t ("heißen" → du heißt). */
    private static boolean endsWithSibilant(String stem) {
        if (stem.isEmpty()) return false;
        char last = stem.charAt(stem.length() - 1);
        return last == 's' || last == 'ß' || last == 'x' || last == 'z';
    }

    private static boolean isVowel(char c) {
        return "aeiouäöü".indexOf(c) >= 0;
    }

    /** Dạng chia ở Präsens; trả về chính infinitive cho ngôi wir và sie/Sie. */
    static String conjugate(String infinitive, Person person) {
        String verb = infinitive.trim().toLowerCase();
        String stem = stem(verb);
        boolean extraE = needsEpentheticE(stem);

        return switch (person) {
            case ICH -> stem + "e";
            case DU -> endsWithSibilant(stem) ? stem + "t" : stem + (extraE ? "est" : "st");
            case ER, IHR -> stem + (extraE ? "et" : "t");
            case WIR, SIE -> verb;
        };
    }
}
