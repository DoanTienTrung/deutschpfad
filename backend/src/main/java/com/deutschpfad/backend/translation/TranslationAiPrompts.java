package com.deutschpfad.backend.translation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Prompt và parser cho phần AI của Luyện dịch: chấm bản dịch (kèm hướng dẫn riêng cho từng dạng bài), và soạn
 * nháp câu luyện theo chủ điểm ngữ pháp hoặc theo chủ đề (collocation, đoạn văn, essay).
 */
public final class TranslationAiPrompts {

    private TranslationAiPrompts() {}

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public record Judgment(TranslationAttempt.Verdict verdict, TranslationChecker.Feedback feedback) {}

    public record DraftItem(
        String viText, String deReference, List<String> alternatives, String keywords, String focus, String gap,
        String partLabel
    ) {}

    public record Draft(String structureNote, List<DraftItem> items) {}

    /** Bài theo chủ điểm ngữ pháp: dịch đúng nghĩa mà không dùng cấu trúc đó thì chỉ "Gần đúng". */
    public static String grammarGuidance(String topicTitleDe) {
        if (topicTitleDe == null || topicTitleDe.isBlank()) return "";
        return """
            Bài này luyện chủ điểm ngữ pháp: "%s". Bản dịch đúng nghĩa nhưng KHÔNG dùng cấu trúc của chủ \
            điểm này thì chấm ALMOST và nói rõ trong note.
            """.formatted(topicTitleDe);
    }

    /** Bài collocation: phải dùng đúng cụm cố định, thay động từ đi kèm bằng từ khác là lỗi dù vẫn hiểu được. */
    public static String collocationGuidance(String phrase) {
        if (phrase == null || phrase.isBlank()) return "";
        return """
            Câu này luyện cụm từ cố định (collocation): "%s". Học viên dùng động từ hay giới từ khác đi với danh \
            từ đó (vd "eine Entscheidung machen" thay cho "treffen") thì tối đa ALMOST, kể cả khi người Đức vẫn \
            hiểu; ghi cụm đúng vào errors.
            """.formatted(phrase);
    }

    /**
     * Câu nằm trong một đoạn văn hoặc bài essay: gửi kèm các câu đứng trước (bản tham khảo) để AI chấp nhận cách
     * nối câu khác mà vẫn hợp ngữ cảnh, và soi từ nối cùng trật tự từ sau từ nối.
     */
    public static String passageGuidance(List<String> previousSentences, String focus) {
        StringBuilder sb = new StringBuilder();
        if (!previousSentences.isEmpty()) {
            sb.append("Câu này nằm trong một đoạn văn. Các câu đứng trước (bản tham khảo): \"")
                .append(String.join(" ", previousSentences)).append("\"\n")
                .append("Chấp nhận từ nối và cách diễn đạt khác nếu vẫn hợp ngữ cảnh. Sai trật tự từ sau từ nối ")
                .append("(vd \"Deshalb ich gehe\") là lỗi ngữ pháp.\n");
        }
        if (focus != null && !focus.isBlank()) {
            sb.append("Câu này nên dùng cấu trúc hoặc mẫu câu: \"").append(focus).append("\". ")
                .append("Diễn đạt khác mà đúng và cùng sắc thái vẫn là CORRECT.\n");
        }
        return sb.toString();
    }

    /**
     * Chấm một bản dịch Việt → Đức. {@code guidance} là hướng dẫn riêng của dạng bài (grammarGuidance,
     * collocationGuidance, passageGuidance), có thể rỗng.
     */
    public static String judge(String viText, String reference, String guidance, String answer) {
        String focusPart = guidance == null ? "" : guidance;
        return """
            Bạn là giáo viên tiếng Đức chấm bài dịch Việt → Đức của người Việt đang học.

            Câu tiếng Việt: "%s"
            Một bản dịch tham khảo đúng: "%s"
            Bản dịch của học viên: "%s"
            %s
            Quy tắc chấm:
            - CORRECT: đúng ngữ pháp, đúng chính tả, đủ ý. Diễn đạt KHÁC bản tham khảo nhưng đúng vẫn là CORRECT \
            (trật tự từ khác hợp lệ, từ đồng nghĩa, du/Sie hợp ngữ cảnh...).
            - ALMOST: đủ ý nhưng còn 1-2 lỗi nhỏ (chính tả, viết hoa, dấu phẩy, sai đuôi một chỗ).
            - WRONG: sai hoặc thiếu ý, hoặc từ 3 lỗi ngữ pháp trở lên.

            Trả về DUY NHẤT một object JSON, không markdown, không giải thích ngoài JSON:
            {"verdict":"CORRECT|ALMOST|WRONG","corrected":"bản dịch của học viên đã sửa ÍT NHẤT có thể, giữ \
            nguyên cách diễn đạt của học viên nếu nó đúng","errors":[{"wrong":"cụm sai trong bài học viên",\
            "right":"cụm đúng","explain":"giải thích ngắn bằng tiếng Việt"}],"note":"một câu nhận xét ngắn bằng \
            tiếng Việt, giọng khích lệ"}
            Nếu CORRECT thì "errors" là [] và "corrected" giống hệt bản của học viên. Viết tiếng Việt có dấu, \
            không dùng dấu gạch ngang dài.
            """.formatted(viText, reference, answer, focusPart);
    }

    private static final Set<String> VERDICTS = Set.of("CORRECT", "ALMOST", "WRONG");

    /** Đọc JSON chấm bài; null nếu không đọc được (AI trả sai định dạng). */
    public static Judgment parseJudgment(String text) {
        if (text == null) return null;
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start < 0 || end <= start) return null;
        try {
            JsonNode root = MAPPER.readTree(text.substring(start, end + 1));
            String verdict = root.path("verdict").asText("").trim().toUpperCase();
            if (!VERDICTS.contains(verdict)) return null;
            List<TranslationChecker.ErrorNote> errors = new ArrayList<>();
            for (JsonNode e : root.path("errors")) {
                String explain = e.path("explain").asText("").strip();
                if (explain.isEmpty()) continue;
                errors.add(new TranslationChecker.ErrorNote(blankToNull(e.path("wrong").asText("")),
                    blankToNull(e.path("right").asText("")), explain));
            }
            return new Judgment(TranslationAttempt.Verdict.valueOf(verdict), new TranslationChecker.Feedback(
                blankToNull(root.path("corrected").asText("")), errors, blankToNull(root.path("note").asText(""))));
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Soạn nháp câu luyện dịch cho một chủ điểm ngữ pháp. Admin duyệt trước khi đăng. "Tự viết mới" là điều kiện
     * bản quyền như phần Ngữ pháp (docs/phase-5-grammar.md).
     */
    public static String draft(String titleDe, String titleVi, String level, String summaryVi, int count) {
        return """
            Bạn là giáo viên tiếng Đức dạy người Việt. Hãy TỰ VIẾT MỚI %d cặp câu để học viên luyện DỊCH từ tiếng \
            Việt sang tiếng Đức, cho chủ điểm ngữ pháp "%s" (%s), trình độ %s.
            Tóm tắt chủ điểm: %s

            Yêu cầu:
            - Câu tiếng Đức BẮT BUỘC dùng đúng cấu trúc của chủ điểm, đúng ngữ pháp, tự nhiên, 4-12 từ, chỉ dùng \
            từ vựng của trình độ %s trở xuống.
            - Câu tiếng Việt tự nhiên như người Việt nói hằng ngày, không dịch từng chữ. Dùng "bạn" cho du, \
            "các bạn" cho ihr, "ông/bà/anh/chị" khi cần Sie.
            - Xếp từ dễ đến khó, chủ đề đời sống hằng ngày, không lặp ý.

            Dòng đầu tiên: CÔNG THỨC: <công thức ngắn của chủ điểm bằng tiếng Việt, vd "haben/sein + Partizip II \
            cuối câu">
            Sau đó mỗi cặp đúng 1 dòng:
            SỐ. câu tiếng Việt ||| câu tiếng Đức ||| các cách dịch đúng khác ngăn bằng ;; (ghi - nếu không có) \
            ||| 2-4 từ khoá tiếng Đức dạng từ điển, danh từ kèm mạo từ, ngăn bằng dấu phẩy
            Không thêm gì khác. Không dùng dấu gạch ngang dài.
            """.formatted(count, titleDe, titleVi, level, summaryVi == null ? "" : summaryVi, level);
    }

    /**
     * Soạn nháp một bài theo chủ đề cho dạng collocation, đoạn văn hoặc essay. Cùng định dạng dòng với
     * {@link #draft}, thêm cột focus, gap và phần bài; cột nào không dùng thì ghi "-".
     */
    public static String draftThemed(TranslationSet.Type type, String level, String theme, int count) {
        String task = switch (type) {
            case COLLOCATION -> """
                %d câu luyện COLLOCATION (cụm động từ + danh từ cố định, vd "eine Entscheidung treffen", "einen \
                Antrag stellen") chủ đề "%s", trình độ %s. Mỗi câu dùng một collocation khác nhau, hay gặp trong \
                đời sống và đề thi. Câu tiếng Đức 5-12 từ.
                Cột focus: collocation dạng từ điển. Cột gap: đúng dạng động từ (hoặc giới từ) của collocation như \
                nó xuất hiện trong câu tiếng Đức, vd "getroffen". Cột phần: -.
                Dòng CÔNG THỨC: một câu ngắn giới thiệu nhóm collocation của chủ đề.
                """.formatted(count, theme, level);
            case PARAGRAPH -> """
                MỘT đoạn văn tiếng Đức liền mạch gồm %d câu, chủ đề "%s", trình độ %s, kể hoặc trình bày theo \
                trình tự. Các câu nối với nhau bằng từ nối (zuerst, danach, außerdem, deshalb, trotzdem, \
                schließlich...), có câu đảo động từ sau từ nối. Mỗi dòng là một câu của đoạn, đúng thứ tự.
                Cột focus: từ nối hoặc cấu trúc chính của câu đó (hoặc -). Cột gap: -. Cột phần: -.
                Dòng CÔNG THỨC: liệt kê các từ nối dùng trong đoạn và lưu ý trật tự từ.
                """.formatted(count, theme, level);
            case ESSAY -> """
                MỘT bài viết nêu ý kiến hoàn chỉnh gồm %d câu theo dạng đề thi Goethe (Forumsbeitrag hoặc \
                Stellungnahme), chủ đề "%s", trình độ %s. Bố cục: Einleitung (2-3 câu), Hauptteil (lập luận hai \
                phía, có ví dụ), Schluss (2 câu kết luận). Dùng Redemittel của văn nghị luận. Mỗi dòng một câu, \
                đúng thứ tự.
                Cột focus: mẫu câu Redemittel câu đó dùng, vd "Einerseits ..., andererseits ..." (hoặc -). Cột \
                gap: -. Cột phần: Einleitung, Hauptteil hoặc Schluss.
                Dòng CÔNG THỨC: các Redemittel chính của bài.
                """.formatted(count, theme, level);
            case GRAMMAR -> throw new IllegalArgumentException("Bài ngữ pháp soạn bằng draft()");
        };
        return """
            Bạn là giáo viên tiếng Đức dạy người Việt. Hãy TỰ VIẾT MỚI %s
            Yêu cầu chung: tiếng Đức đúng ngữ pháp, tự nhiên, từ vựng không vượt trình độ %s. Câu tiếng Việt tự \
            nhiên như người Việt nói, không dịch từng chữ.

            Dòng đầu tiên: CÔNG THỨC: <nội dung theo yêu cầu ở trên, bằng tiếng Việt>
            Sau đó mỗi câu đúng 1 dòng:
            SỐ. câu tiếng Việt ||| câu tiếng Đức ||| các cách dịch đúng khác ngăn bằng ;; (hoặc -) ||| 2-4 từ khoá \
            tiếng Đức dạng từ điển ||| focus ||| gap ||| phần
            Không thêm gì khác. Không dùng dấu gạch ngang dài.
            """.formatted(task.strip(), level);
    }

    private static final Pattern DRAFT_LINE = Pattern.compile("^\\s*\\d+[.)]\\s*(.+)$");

    public static Draft parseDraft(String text) {
        if (text == null) return new Draft(null, List.of());
        String note = null;
        List<DraftItem> items = new ArrayList<>();
        for (String line : text.strip().split("\\R")) {
            String trimmed = line.strip();
            if (trimmed.toUpperCase().startsWith("CÔNG THỨC:")) {
                note = blankToNull(trimmed.substring("CÔNG THỨC:".length()));
                continue;
            }
            Matcher m = DRAFT_LINE.matcher(trimmed);
            if (!m.matches()) continue;
            String[] parts = m.group(1).split("\\|\\|\\|");
            if (parts.length < 2) continue;
            String vi = parts[0].strip();
            String de = parts[1].strip();
            if (vi.isEmpty() || de.isEmpty()) continue;
            List<String> alternatives = new ArrayList<>();
            if (parts.length > 2) {
                for (String alt : parts[2].split(";;")) {
                    String a = alt.strip();
                    if (!a.isEmpty() && !a.equals("-") && !a.equals(de)) alternatives.add(a);
                }
            }
            String keywords = parts.length > 3 ? blankToNull(parts[3]) : null;
            String focus = parts.length > 4 ? blankToNull(parts[4]) : null;
            String gap = parts.length > 5 ? blankToNull(parts[5]) : null;
            // Từ khoét phải nằm trong câu tham khảo, nếu không chế độ "Điền từ" không dựng được câu.
            if (gap != null && !de.contains(gap.split("\\|")[0].strip())) gap = null;
            String part = parts.length > 6 ? blankToNull(parts[6]) : null;
            items.add(new DraftItem(vi, de, alternatives, keywords, focus, gap, part));
        }
        return new Draft(note, items);
    }

    private static String blankToNull(String s) {
        String v = s == null ? "" : s.strip();
        return v.isEmpty() || v.equals("-") ? null : v;
    }
}
