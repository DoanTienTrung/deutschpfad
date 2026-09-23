package com.deutschpfad.backend.grammar;

import org.springframework.stereotype.Service;

/**
 * Chấm bài tập ngữ pháp. Logic thuần (không đụng DB/AI) để test được bằng unit test như
 * {@code Sm2Calculator}.
 *
 * <p>Quy ước đáp án dùng chung với {@code ReadingQuestion.correctAnswer}: nhiều đáp án chấp nhận
 * được ngăn bằng "/".
 */
@Service
public class GrammarGradingService {

    public boolean isCorrect(GrammarExercise exercise, String submittedAnswer) {
        if (submittedAnswer == null || submittedAnswer.isBlank()) return false;
        for (String accepted : exercise.getCorrectAnswer().split("/")) {
            if (normalize(accepted).equals(normalize(submittedAnswer))) return true;
        }
        return false;
    }

    /**
     * Chuẩn hoá trước khi so khớp:
     * <ul>
     *   <li>bỏ khoảng trắng thừa (gồm cả khoảng trắng lặp giữa các từ ở bài WORD_ORDER)</li>
     *   <li>không phân biệt hoa/thường</li>
     *   <li>bỏ dấu câu cuối câu — thiếu dấu chấm không phải lỗi ngữ pháp</li>
     *   <li>chấp nhận cách gõ thay thế ae/oe/ue/ss cho ä/ö/ü/ß, vì bàn phím tiếng Việt không có
     *       sẵn ký tự Đức. Lưu ý chiều biến đổi: "älter" thành "aelter", nên người gõ "alter"
     *       (thiếu Umlaut hẳn) vẫn bị tính sai — đúng ý đồ với các bài luyện Umlaut.</li>
     * </ul>
     */
    static String normalize(String raw) {
        String text = raw.trim().toLowerCase();
        text = text.replaceAll("[.!?]+$", "");
        text = text.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss");
        text = text.replaceAll("\\s+", " ");
        return text.trim();
    }
}
