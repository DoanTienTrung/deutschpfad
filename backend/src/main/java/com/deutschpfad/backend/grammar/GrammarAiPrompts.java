package com.deutschpfad.backend.grammar;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Prompt và parser cho phần AI của Ngữ pháp. Đặt ở package {@code grammar} thay vì nhét thêm vào
 * {@code GroqAiService} (đã ~800 dòng, gánh sẵn Listening/Reading/Vocabulary) — cả 3 tầng AI
 * Groq → Gemini → OpenRouter đều gọi chung từ đây, nên prompt chỉ có một bản duy nhất.
 */
public final class GrammarAiPrompts {

    private GrammarAiPrompts() {}

    /**
     * Lý thuyết do AI soạn nháp. Câu "TỰ VIẾT MỚI HOÀN TOÀN, không sao chép, không dịch lại" là
     * điều kiện then chốt của quyết định bản quyền ở Phase 5 (xem docs/phase-5-grammar.md) — sửa
     * prompt này thì phải đọc lại mục đó trước.
     */
    public static String theory(String titleDe, String titleVi, String level) {
        String viPart = (titleVi != null && !titleVi.isBlank()) ? " (" + titleVi + ")" : "";
        return """
            Bạn là giáo viên tiếng Đức dạy người Việt. Hãy TỰ VIẾT MỚI HOÀN TOÀN (không sao chép, \
            không dịch lại bất kỳ sách hay tài liệu nào có sẵn) phần lý thuyết ngắn gọn bằng \
            TIẾNG VIỆT cho chủ điểm ngữ pháp "%s"%s, trình độ %s theo khung CEFR.

            Yêu cầu nội dung:
            - Giải thích bằng tiếng Việt; ví dụ minh hoạ bằng tiếng Đức kèm nghĩa tiếng Việt
            - Nêu rõ ít nhất 1 lỗi người Việt hay mắc ở chủ điểm này và vì sao (thường do khác \
            biệt với cách diễn đạt tiếng Việt)
            - Nếu có quy tắc dạng bảng (chia đuôi, biến cách...) thì trình bày bằng bảng
            - Độ dài vừa phải, đọc hết trong 3-5 phút

            Định dạng: trả về markdown thuần (dùng ##, **, danh sách, bảng kiểu GitHub). Không \
            thêm lời mở đầu hay kết luận ngoài nội dung bài, không bọc trong khối ```.
            """.formatted(titleDe, viPart, level);
    }

    /**
     * Bài tập do AI soạn nháp — dành cho các dạng CẦN NGỮ CẢNH mà
     * {@link GrammarExerciseGenerator} không sinh deterministic được (trật tự từ, liên từ, mệnh
     * đề phụ, giới từ...). Định dạng mỗi bài 1 dòng ngăn bằng "|||" bê theo khuôn
     * {@code buildReadingQuestionsPrompt} bên Reading để parser cũng đơn giản như vậy.
     */
    public static String exercises(String titleDe, String level, String theoryMd, int count) {
        String theoryPart = (theoryMd != null && !theoryMd.isBlank())
            ? "Bài tập phải bám đúng phần lý thuyết sau:\n\"\"\"\n" + theoryMd + "\n\"\"\"\n\n"
            : "";
        return """
            Bạn là giáo viên tiếng Đức. Hãy soạn %d bài tập ngữ pháp MỚI HOÀN TOÀN (tự nghĩ ra, \
            không lấy từ sách nào) cho chủ điểm "%s", trình độ %s theo khung CEFR.

            %sMỗi bài tập trả về đúng 1 dòng theo định dạng:
            SỐ. loại bài ||| câu đề tiếng Đức ||| đáp án A ||| đáp án B ||| đáp án C ||| đáp án \
            đúng ||| giải thích ngắn bằng tiếng Việt

            Trong đó "loại bài" là MỘT trong: FILL_BLANK, MULTIPLE_CHOICE, WORD_ORDER.
            - FILL_BLANK: câu đề chứa ___ ở chỗ cần điền; 3 ô đáp án A/B/C ghi dấu - ; cột "đáp \
            án đúng" ghi chính từ cần điền
            - MULTIPLE_CHOICE: điền đủ 3 phương án vào A/B/C; cột "đáp án đúng" ghi đúng MỘT chữ \
            cái A, B hoặc C
            - WORD_ORDER: câu đề là các từ bị xáo trộn ngăn nhau bằng " / "; 3 ô đáp án A/B/C ghi \
            dấu - ; cột "đáp án đúng" ghi câu hoàn chỉnh đúng trật tự

            Chỉ trả về các dòng bài tập theo đúng định dạng trên, không thêm lời mở đầu hay kết \
            luận. Câu đề và đáp án viết bằng tiếng Đức, chỉ phần giải thích viết bằng tiếng Việt.
            """.formatted(count, titleDe, level, theoryPart);
    }

    private static final Pattern EXERCISE_LINE = Pattern.compile(
        "^\\s*\\d+[.)]\\s*([A-Za-z_]+)\\s*\\|\\|\\|\\s*(.+?)\\s*\\|\\|\\|\\s*(.*?)\\s*\\|\\|\\|"
            + "\\s*(.*?)\\s*\\|\\|\\|\\s*(.*?)\\s*\\|\\|\\|\\s*(.+?)\\s*\\|\\|\\|\\s*(.+)$"
    );

    public static List<GrammarExerciseDraft> parseExercises(String text) {
        List<GrammarExerciseDraft> result = new ArrayList<>();
        if (text == null) return result;

        for (String line : text.strip().split("\\R")) {
            Matcher matcher = EXERCISE_LINE.matcher(line);
            if (!matcher.matches()) continue;

            GrammarExercise.ExerciseType type;
            try {
                type = GrammarExercise.ExerciseType.valueOf(matcher.group(1).trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Model bịa ra loại bài không tồn tại -> bỏ dòng đó, không đoán thay nó.
                continue;
            }
            // CONJUGATE để bộ sinh deterministic lo, AI không cần đụng tới.
            if (type == GrammarExercise.ExerciseType.CONJUGATE) continue;

            boolean multipleChoice = type == GrammarExercise.ExerciseType.MULTIPLE_CHOICE;
            String correct = matcher.group(6).trim();
            if (multipleChoice && !correct.matches("[ABCabc]")) continue;

            result.add(new GrammarExerciseDraft(
                type,
                matcher.group(2).trim(),
                multipleChoice ? blankToNull(matcher.group(3)) : null,
                multipleChoice ? blankToNull(matcher.group(4)) : null,
                multipleChoice ? blankToNull(matcher.group(5)) : null,
                multipleChoice ? correct.toUpperCase() : correct,
                matcher.group(7).trim()
            ));
        }
        return result;
    }

    private static String blankToNull(String value) {
        String trimmed = value == null ? "" : value.trim();
        return trimmed.isEmpty() || trimmed.equals("-") ? null : trimmed;
    }
}
