package com.deutschpfad.backend.tutor;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record TutorAskRequest(
        @NotBlank String question,
        List<TutorHistoryTurn> history
) {
    // Client có thể không gửi "history" (lần hỏi đầu tiên) — mặc định thành list rỗng thay vì
    // null, để TutorAiService.ask() lặp qua bình thường mà không cần check null riêng.
    public TutorAskRequest {
        if (history == null) {
            history = List.of();
        }
    }
}
