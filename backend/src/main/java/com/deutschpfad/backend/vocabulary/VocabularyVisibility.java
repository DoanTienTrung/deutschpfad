package com.deutschpfad.backend.vocabulary;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Nguồn từ vựng nào đang ẩn với người học (admin vẫn thấy đủ).
 *
 * <p><b>Vì sao có:</b> bộ "Bộ từ của Giang" (nguồn TEXTBOOK) lấy từ bản scan các trang Lernwortschatz
 * của giáo trình Menschen A1 (Hueber) — cột tiếng Đức và câu ví dụ là nội dung in của nhà xuất bản.
 * Ẩn đi trong lúc chờ thay câu ví dụ bằng câu tự soạn; dữ liệu và lịch ôn của người đã học vẫn giữ.
 *
 * <p>Cấu hình được ({@code app.vocabulary.hidden-sources}) để mở lại mà không cần sửa code.
 */
@Component
public class VocabularyVisibility {

    private final Set<VocabularyItem.Source> hidden;

    public VocabularyVisibility(@Value("${app.vocabulary.hidden-sources:TEXTBOOK}") List<VocabularyItem.Source> hidden) {
        this.hidden = hidden.isEmpty() ? EnumSet.noneOf(VocabularyItem.Source.class) : EnumSet.copyOf(hidden);
    }

    public boolean isHidden(VocabularyItem.Source source) {
        return hidden.contains(source);
    }

    public boolean canSee(VocabularyItem.Source source, Authentication authentication) {
        return !isHidden(source) || isAdmin(authentication);
    }

    private static boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
