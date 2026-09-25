package com.deutschpfad.backend.grammar;

import java.util.List;

/**
 * Trả lời câu hỏi "hôm nay học gì" của trang Ngữ pháp.
 *
 * <p>{@code due} là chủ điểm đã đến hạn ôn theo lịch SM-2 — ưu tiên cao nhất, vì quên rồi mới là
 * vấn đề thật. {@code next} là chủ điểm kế tiếp chưa đụng tới, dùng khi không còn gì phải ôn.
 */
public record GrammarReviewResponse(
    List<GrammarTopicSummaryResponse> due,
    GrammarTopicSummaryResponse next
) {
}
