package com.deutschpfad.backend.grammar;

import java.util.List;

/**
 * Thống kê tiến độ ngữ pháp theo từng level, dùng cho dashboard ở ProfilePage.
 * {@code notStarted} = tổng chủ điểm trừ đi số đã đụng tới, nên luôn khớp với danh sách hiển thị.
 */
public record GrammarProgressSummaryResponse(List<LevelProgress> levels) {
    public record LevelProgress(
        String level,
        int totalTopics,
        int mastered,
        int learning,
        int notStarted
    ) {}
}
