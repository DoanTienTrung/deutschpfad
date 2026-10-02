package com.deutschpfad.backend.vocabulary;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Khoá định danh một TỪ, độc lập với nguồn và cách ghi.
 *
 * <p><b>Vì sao cần:</b> cùng một từ xuất hiện ở nhiều lộ trình — "die Mutter" ở cả nguồn tần suất,
 * Goethe và giáo trình (production: 2.236 từ trùng khác nguồn). Trước đây lịch ôn SM-2 gắn với từng
 * DÒNG, nên một từ có tới 3 lịch ôn độc lập và mâu thuẫn nhau ("đã nhớ" / "dễ" / "đã quên" cùng
 * lúc), bị ôn gấp 3, và số "từ đã học" bị đếm phồng. Giờ lịch ôn gắn với khoá này.
 *
 * <p><b>Nguyên tắc: thà không gộp còn hơn gộp nhầm.</b> Gộp nhầm hai từ khác nhau làm hỏng lịch ôn
 * của cả hai; bỏ sót một cặp thì chỉ giữ nguyên tình trạng cũ.
 *
 * <p><b>Hai nhánh xử lý — rút ra từ việc chạy thử trên 1.736 từ giáo trình thật.</b> Bản đầu dùng
 * một bộ quy tắc chung (viết thường hết, bỏ mọi chú thích, bỏ mọi thứ sau dấu phẩy) và đã GỘP NHẦM:
 * "Sie" (Ngài) / "sie (Singular)" (cô ấy) / "sie (Plural)" (họ) thành một từ; "sein" (là) với
 * "sein, -e" (của anh ấy); "Ihr-" / "ihr" / "ihr, -e". Lý do: những quy tắc đó chỉ an toàn với DANH TỪ.
 * <ul>
 *   <li><b>Danh từ</b> (bắt đầu bằng der/die/das): phần sau dấu phẩy chắc chắn là số nhiều, chú thích
 *       trong ngoặc ((Sg.), (kg)…) chắc chắn không đổi nghĩa → bỏ hết; viết thường được vì danh từ
 *       không có cặp khác nhau chỉ ở chữ hoa.</li>
 *   <li><b>Từ loại khác</b>: GIỮ chữ hoa (Sie ≠ sie), GIỮ phần sau dấu phẩy (đuôi biến cách của đại từ
 *       sở hữu), chỉ bỏ chú thích là MỘT từ viết thường đứng cuối — kiểu Partizip "zeigen (gezeigt)".
 *       Chú thích viết hoa như "(Singular)" là để phân biệt nghĩa → giữ.</li>
 * </ul>
 *
 * <p>Mọi đường ghi qua JPA đều tự tính lại khoá ({@link VocabularyItem}). Migration SQL nào sửa
 * {@code german_word} thì PHẢI cập nhật {@code word_key} theo.
 */
public final class WordKey {

    private static final Pattern NOUN = Pattern.compile("(?i)^(der|die|das)(\\s|/).*");
    private static final Pattern ANNOTATION = Pattern.compile("\\s+\\([^)]*\\)(?=\\s|,|/|$)");
    private static final Pattern TRAILING_LOWERCASE_NOTE = Pattern.compile("\\s+\\(\\p{Ll}+\\)$");
    private static final Pattern ARTICLE_ONLY = Pattern.compile("(?i)^(der|die|das)$");
    private static final Pattern WITH_ARTICLE = Pattern.compile("(?i)^(der|die|das)\\s+(.+)$");
    private static final Pattern OPTIONAL_PART = Pattern.compile("\\(([^()]*)\\)");
    private static final Pattern HYPHEN_BETWEEN_LOWERCASE = Pattern.compile("(\\p{Ll})-(\\p{Ll})");

    private WordKey() {
    }

    public static String of(String germanWord) {
        if (germanWord == null) return "";
        String text = Normalizer.normalize(germanWord, Normalizer.Form.NFC).trim();

        // "Senioren (Pl.): Senioren-" — phần sau dấu hai chấm là ghi chú.
        int colon = text.indexOf(':');
        if (colon > 0) text = text.substring(0, colon).trim();

        String key = NOUN.matcher(text).matches() ? nounKey(text) : otherKey(text);
        return key.replaceAll("\\s+", " ").trim();
    }

    private static String nounKey(String text) {
        // Bỏ chú thích TRƯỚC khi tách "/" vì "/" có thể nằm trong ngoặc: "(m²/qm)".
        String withoutNotes = ANNOTATION.matcher(text).replaceAll("");
        String first = firstAlternative(withoutNotes);
        // Phần tuỳ chọn còn lại: "Kilo(gramm)" → "Kilogramm", "(Regen-)Schirm" → "Regenschirm".
        return expandOptional(first).toLowerCase(Locale.ROOT);
    }

    private static String otherKey(String text) {
        String key = text;
        // Chỉ bỏ chú thích là MỘT từ viết thường ở cuối, có thể lặp: "verbinden (mit) (verbunden)".
        Matcher m;
        while ((m = TRAILING_LOWERCASE_NOTE.matcher(key)).find()) {
            key = key.substring(0, m.start());
        }
        // Động từ tách được: "ab-fahren" ≡ "abfahren". Chỉ nối khi hai bên đều là chữ thường, nên
        // không đụng tới "E-Mail".
        return HYPHEN_BETWEEN_LOWERCASE.matcher(key).replaceAll("$1$2");
    }

    /** Phương án đầu tiên, đã bỏ số nhiều sau dấu phẩy. "der/die X" → "der X". */
    private static String firstAlternative(String text) {
        List<String> alternatives = new ArrayList<>();
        for (String alt : splitOutsideParens(text, '/')) {
            alternatives.add(splitOutsideParens(alt, ',').get(0).trim());
        }
        String first = alternatives.get(0);
        if (ARTICLE_ONLY.matcher(first).matches()) {
            for (String next : alternatives.subList(1, alternatives.size())) {
                Matcher m = WITH_ARTICLE.matcher(next);
                if (m.matches()) return first + " " + m.group(2);
            }
        }
        return first;
    }

    /** Mở phần tuỳ chọn: "Kilo(gramm)" → "Kilogramm", "(Regen-)Schirm" → "Regenschirm". */
    static String expandOptional(String text) {
        Matcher m = OPTIONAL_PART.matcher(text);
        if (!m.find()) return text;
        String before = text.substring(0, m.start());
        String part = m.group(1);
        String after = text.substring(m.end());
        String joined = part.endsWith("-") && !after.isEmpty()
            ? before + part.substring(0, part.length() - 1) + Character.toLowerCase(after.charAt(0)) + after.substring(1)
            : before + part + after;
        return expandOptional(joined);
    }

    private static List<String> splitOutsideParens(String text, char sep) {
        List<String> parts = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        int depth = 0;
        for (char ch : text.toCharArray()) {
            if (ch == '(') depth++;
            if (ch == ')') depth = Math.max(0, depth - 1);
            if (ch == sep && depth == 0) {
                parts.add(current.toString());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }
        parts.add(current.toString());
        return parts;
    }
}
