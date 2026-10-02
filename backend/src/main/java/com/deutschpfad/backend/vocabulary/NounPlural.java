package com.deutschpfad.backend.vocabulary;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Dạng số nhiều của danh từ, để hiện riêng trên thẻ ("Số nhiều: die Bilder") thay vì bắt người học
 * tự giải ký hiệu từ điển "das Bild, -er".
 *
 * <p><b>Ba nguồn, theo thứ tự tin cậy:</b>
 * <ol>
 *   <li>Ký hiệu ngay trong từ — dữ liệu giáo trình ghi kiểu "die Mutter, ¨" / "das Buch, ¨er".</li>
 *   <li>Ký hiệu của một dòng KHÁC cùng {@link WordKey}: "die Mutter" ở lộ trình tần suất không có
 *       ký hiệu, nhưng "die Mutter, ¨" ở giáo trình có → dùng chung.</li>
 *   <li>Bảng tra Wiktionary ({@code german_noun_plurals}). Chỉ chứa từ có MỘT dạng số nhiều duy
 *       nhất theo (từ, giống): "Mutter" có cả "Mütter" (mẹ) lẫn "Muttern" (đai ốc), "Bank" có cả
 *       "Bänke" lẫn "Banken" — không biết dòng nào mang nghĩa nào nên bỏ trống, không đoán.</li>
 * </ol>
 *
 * <p><b>Thà để trống còn hơn sai</b> — giống {@link WordKey}. Ký hiệu nào không đọc chắc được thì
 * trả về rỗng. Từ được đánh dấu "(Sg.)" / "(Pl.)" ở bất kỳ dòng nào cùng khoá thì cả nhóm không có
 * số nhiều: người soạn giáo trình đã quyết định với người học thì từ này chỉ dùng một dạng (Wiktionary
 * vẫn có "Alphabete", "Polizeien" nhưng người học A1 không cần).
 */
public final class NounPlural {

    private static final Pattern ANNOTATION = Pattern.compile("\\s+\\([^)]*\\)(?=\\s|,|/|$)");
    private static final Pattern NUMBER_RESTRICTED = Pattern.compile("\\((Sg|Pl)\\.?\\)");
    private static final Pattern NOUN_WITH_NOTATION = Pattern.compile("(?i)^(der|die|das)\\s+([^,]+),\\s*(.+)$");
    private static final Pattern NOUN_HEAD = Pattern.compile("(?i)^(der|die|das)\\s+(.+)$");
    private static final Pattern ARTICLE_ONLY = Pattern.compile("(?i)^(der|die|das)$");

    private static final Pattern SAME = Pattern.compile("^-$");
    private static final Pattern UMLAUT_ONLY = Pattern.compile("^[¨=]-?$");
    private static final Pattern UMLAUT_SUFFIX = Pattern.compile("^[¨=]-?(\\p{Ll}+)$");
    private static final Pattern SHORT_SUFFIX = Pattern.compile("^-(\\p{Ll}{1,3})$");
    private static final Pattern REPLACED_TAIL = Pattern.compile("^-(\\p{Ll}{4,})$");
    private static final Pattern FULL_WORD = Pattern.compile("^\\p{Lu}[\\p{L}-]*$");

    private NounPlural() {
    }

    /** Số nhiều đọc từ ký hiệu trong chính từ này, vd. "das Buch, ¨er" → "Bücher". */
    public static Optional<String> fromNotation(String germanWord) {
        String text = firstAlternative(germanWord);
        Matcher m = NOUN_WITH_NOTATION.matcher(text);
        if (!m.matches()) return Optional.empty();
        String noun = WordKey.expandOptional(ANNOTATION.matcher(m.group(2)).replaceAll("").trim());
        String notation = ANNOTATION.matcher(m.group(3)).replaceAll("").trim();
        if (noun.isEmpty() || noun.contains("(") || noun.contains(" ")) return Optional.empty();

        String plural = apply(noun, notation);
        return plural != null && Character.isUpperCase(plural.charAt(0)) ? Optional.of(plural) : Optional.empty();
    }

    /**
     * Danh từ và giống để tra bảng Wiktionary: "das Auto" → ("Auto", "n"). Rỗng nếu không phải danh
     * từ một mạo từ rõ ràng ("der/die Angestellte" là danh từ biến cách theo tính từ — bảng không có).
     */
    public static Optional<String[]> lemmaAndGenus(String germanWord) {
        String text = firstAlternative(germanWord);
        int comma = text.indexOf(',');
        if (comma >= 0) text = text.substring(0, comma);
        Matcher m = NOUN_HEAD.matcher(ANNOTATION.matcher(text).replaceAll("").trim());
        if (!m.matches()) return Optional.empty();
        String lemma = WordKey.expandOptional(m.group(2).trim());
        if (lemma.isEmpty() || lemma.contains("(") || lemma.contains(" ")) return Optional.empty();
        if (Character.isLowerCase(lemma.charAt(0))) {
            lemma = Character.toUpperCase(lemma.charAt(0)) + lemma.substring(1);
        }
        String genus = switch (m.group(1).toLowerCase()) {
            case "der" -> "m";
            case "die" -> "f";
            default -> "n";
        };
        return Optional.of(new String[] {lemma, genus});
    }

    /**
     * Số nhiều cho cả một nhóm dòng cùng {@link WordKey}, cùng thứ tự với đầu vào. Dùng chung cho
     * migration và lúc admin lưu từ, để hai đường không lệch nhau.
     *
     * @param lookup tra bảng Wiktionary theo (danh từ, giống); trả null nếu không có
     */
    public static List<String> resolveFamily(List<String> germanWords, BiFunction<String, String, String> lookup) {
        List<String> result = new ArrayList<>();
        if (germanWords.stream().anyMatch(w -> w != null && NUMBER_RESTRICTED.matcher(w).find())) {
            germanWords.forEach(w -> result.add(null));
            return result;
        }

        Set<String> fromNotations = new LinkedHashSet<>();
        for (String word : germanWords) fromNotation(word).ifPresent(fromNotations::add);
        // Hai dòng cùng khoá mà ký hiệu ra hai số nhiều khác nhau → không biết dòng nào đúng nghĩa
        // của dòng không có ký hiệu, nên không chia sẻ.
        String shared = fromNotations.size() == 1 ? fromNotations.iterator().next() : null;

        for (String word : germanWords) {
            Optional<String> own = fromNotation(word);
            if (own.isPresent()) {
                result.add(own.get());
            } else if (shared != null) {
                result.add(shared);
            } else {
                result.add(lemmaAndGenus(word).map(lg -> lookup.apply(lg[0], lg[1])).orElse(null));
            }
        }
        return result;
    }

    private static String apply(String noun, String notation) {
        if (SAME.matcher(notation).matches()) return noun;
        if (UMLAUT_ONLY.matcher(notation).matches()) return umlaut(noun);
        Matcher m = UMLAUT_SUFFIX.matcher(notation);
        if (m.matches()) {
            String umlauted = umlaut(noun);
            return umlauted == null ? null : umlauted + m.group(1);
        }
        m = SHORT_SUFFIX.matcher(notation);
        if (m.matches()) {
            // "die Maske, -en" (lỗi dữ liệu giáo trình) sẽ ra "Maskeen" — danh từ tận cùng -e không
            // bao giờ thêm -en. Gặp thì để trống chứ không hiện một từ không tồn tại.
            if (noun.endsWith("e") && m.group(1).equals("en")) return null;
            return noun + m.group(1);
        }
        m = REPLACED_TAIL.matcher(notation);
        if (m.matches()) return replaceTail(noun, m.group(1));
        if (FULL_WORD.matcher(notation).matches()) return notation;
        return null;
    }

    /** "Stadtzentrum, -zentren" → "Stadtzentren"; "Hotelfachmann, -leute" → "Hotelfachleute". */
    private static String replaceTail(String noun, String tail) {
        String lower = noun.toLowerCase();
        int at = lower.lastIndexOf(tail.substring(0, 3));
        if (at > 0) return noun.substring(0, at) + tail;
        if (tail.equals("leute") && lower.endsWith("mann") && noun.length() > 4) {
            return noun.substring(0, noun.length() - 4) + tail;
        }
        return null;
    }

    /**
     * Biến âm nguyên âm gốc CUỐI cùng: a→ä, o→ö, u→ü, au→äu. Bỏ qua e/i và nguyên âm đôi "eu"/"äu"
     * (đã biến âm sẵn): "Apfel" → "Äpfel", "Bahnhof" → "Bahnhöf", "Kaufhaus" → "Kaufhäus".
     */
    static String umlaut(String noun) {
        char[] chars = noun.toCharArray();
        for (int i = chars.length - 1; i >= 0; i--) {
            char c = Character.toLowerCase(chars[i]);
            if (c == 'u' && i > 0) {
                char before = Character.toLowerCase(chars[i - 1]);
                if (before == 'a') {
                    chars[i - 1] = withUmlaut(chars[i - 1]);
                    return new String(chars);
                }
                if (before == 'e' || before == 'ä') continue;
            }
            if (c == 'a' || c == 'o' || c == 'u') {
                chars[i] = withUmlaut(chars[i]);
                return new String(chars);
            }
        }
        return null;
    }

    private static char withUmlaut(char c) {
        return switch (c) {
            case 'a' -> 'ä';
            case 'o' -> 'ö';
            case 'u' -> 'ü';
            case 'A' -> 'Ä';
            case 'O' -> 'Ö';
            case 'U' -> 'Ü';
            default -> c;
        };
    }

    /** Phương án đầu của cặp "der Fahrer, -/die Fahrerin, -nen", đã bỏ ghi chú sau dấu hai chấm. */
    private static String firstAlternative(String germanWord) {
        if (germanWord == null) return "";
        String text = Normalizer.normalize(germanWord, Normalizer.Form.NFC).trim();
        int colon = text.indexOf(':');
        if (colon > 0) text = text.substring(0, colon).trim();
        List<String> alternatives = new ArrayList<>();
        int depth = 0;
        int start = 0;
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch == '(') depth++;
            if (ch == ')') depth = Math.max(0, depth - 1);
            if (ch == '/' && depth == 0) {
                alternatives.add(text.substring(start, i).trim());
                start = i + 1;
            }
        }
        alternatives.add(text.substring(start).trim());
        // "der/die Deutsche, -n": phương án đầu chỉ là mạo từ, danh từ + ký hiệu nằm ở phương án sau.
        if (alternatives.size() > 1 && ARTICLE_ONLY.matcher(alternatives.get(0)).matches()) {
            return alternatives.get(0) + " " + NOUN_HEAD.matcher(alternatives.get(1)).replaceFirst("$2");
        }
        return alternatives.get(0);
    }
}
