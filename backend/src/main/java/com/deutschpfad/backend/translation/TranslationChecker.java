package com.deutschpfad.backend.translation;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Chấm bản dịch tại chỗ, không gọi AI: khớp câu tham khảo (hoặc một cách dịch đúng khác) thì "Đúng"; chỉ
 * khác dấu phẩy, viết hoa hay ae/oe/ue/ss thì "Gần đúng" kèm lỗi cụ thể. Còn lại trả null, để AI xét
 * (có thể là cách diễn đạt khác nhưng vẫn đúng).
 */
public final class TranslationChecker {

    private TranslationChecker() {}

    public record ErrorNote(String wrong, String right, String explain) {}

    public record Feedback(String corrected, List<ErrorNote> errors, String note) {}

    public record Result(TranslationAttempt.Verdict verdict, Feedback feedback) {}

    /**
     * Dạng chuẩn để so khớp và làm khoá cache: gộp khoảng trắng, thống nhất dấu nháy, bỏ khoảng trắng trước
     * dấu câu, bỏ dấu câu cuối câu (quên dấu chấm hay dấu hỏi không tính là sai). Giữ hoa thường và dấu phẩy
     * vì trong tiếng Đức đó là lỗi thật.
     */
    public static String normalize(String text) {
        if (text == null) return "";
        String s = text
            .replace('„', '"').replace('“', '"').replace('”', '"')
            .replace('‚', '\'').replace('‘', '\'').replace('’', '\'')
            .replaceAll("\\s+", " ")
            .replaceAll(" ([,;:!?.])", "$1")
            .strip();
        return s.replaceAll("[.!?…\\s]+$", "").strip();
    }

    public static Result check(String answer, List<String> acceptedAnswers) {
        String a = normalize(answer);
        if (a.isEmpty()) return null;
        Result almost = null;
        for (String reference : acceptedAnswers) {
            String r = normalize(reference);
            if (a.equals(r)) {
                return new Result(TranslationAttempt.Verdict.CORRECT, new Feedback(reference.strip(), List.of(), null));
            }
            if (almost == null && loose(a).equals(loose(r))) {
                almost = new Result(TranslationAttempt.Verdict.ALMOST,
                    new Feedback(reference.strip(), smallErrors(a, r), "Đúng ý rồi, chỉ còn lỗi nhỏ về chính tả hoặc dấu câu."));
            }
        }
        return almost;
    }

    /** Bỏ dấu phẩy, viết thường, ä→ae... : hai câu bằng nhau ở dạng này thì chỉ khác lỗi nhỏ. */
    static String loose(String normalized) {
        return transliterate(withoutCommas(normalized).toLowerCase(Locale.GERMAN));
    }

    private static String withoutCommas(String s) {
        return s.replace(",", "").replaceAll("\\s+", " ").strip();
    }

    private static String transliterate(String s) {
        return s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss");
    }

    private static List<ErrorNote> smallErrors(String answer, String reference) {
        List<ErrorNote> errors = new ArrayList<>();
        if (!commaPositions(answer).equals(commaPositions(reference))) {
            errors.add(new ErrorNote(null, null,
                "Dấu phẩy: tiếng Đức bắt buộc có dấu phẩy trước mệnh đề phụ (weil, dass, wenn...) và giữa hai câu nối bằng aber, sondern."));
        }
        String[] aw = withoutCommas(answer).split(" ");
        String[] rw = withoutCommas(reference).split(" ");
        for (int i = 0; i < Math.min(aw.length, rw.length); i++) {
            if (aw[i].equals(rw[i])) continue;
            String al = aw[i].toLowerCase(Locale.GERMAN);
            String rl = rw[i].toLowerCase(Locale.GERMAN);
            if (al.equals(rl)) {
                boolean shouldCapitalize = Character.isUpperCase(rw[i].charAt(0));
                errors.add(new ErrorNote(aw[i], rw[i], shouldCapitalize
                    ? (i == 0 ? "Chữ đầu câu viết hoa." : "Danh từ (và Sie, Ihnen lịch sự) luôn viết hoa chữ cái đầu.")
                    : "Từ này viết thường."));
            } else {
                errors.add(new ErrorNote(aw[i], rw[i], "Chính tả: dùng ä, ö, ü, ß (gõ được bằng hàng phím bên dưới ô nhập)."));
            }
        }
        return errors;
    }

    /** Vị trí dấu phẩy tính theo số từ đứng trước nó, để so hai câu có thể khác hoa thường. */
    private static List<Integer> commaPositions(String s) {
        List<Integer> positions = new ArrayList<>();
        int words = 0;
        for (String token : s.split(" ")) {
            words++;
            if (token.endsWith(",")) positions.add(words);
        }
        return positions;
    }
}
