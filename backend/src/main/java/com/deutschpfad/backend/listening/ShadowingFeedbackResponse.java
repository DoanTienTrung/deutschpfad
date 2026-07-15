package com.deutschpfad.backend.listening;

import java.util.List;

public record ShadowingFeedbackResponse(
    boolean available, String transcript, List<PronunciationScorer.WordResult> words, int scorePercent
) {
    public static ShadowingFeedbackResponse unavailable() {
        return new ShadowingFeedbackResponse(false, null, List.of(), 0);
    }

    public static ShadowingFeedbackResponse from(String transcript, PronunciationScorer.ScoreResult score) {
        return new ShadowingFeedbackResponse(true, transcript, score.words(), score.scorePercent());
    }
}
