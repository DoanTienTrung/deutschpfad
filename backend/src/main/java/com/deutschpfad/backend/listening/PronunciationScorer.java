package com.deutschpfad.backend.listening;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Compares a recognized (STT) transcript against the reference sentence, word by word, using
 * edit-distance alignment so word insertions/deletions in the recognized text don't shift every
 * later word out of position. Pure logic, no Spring dependency — same pattern as
 * {@link TranscriptParser}, easy to unit test.
 */
public class PronunciationScorer {

    public record WordResult(String word, boolean correct) {}

    public record ScoreResult(List<WordResult> words, int scorePercent) {}

    public static ScoreResult score(String referenceText, String recognizedText) {
        List<String> refWords = normalize(referenceText);
        List<String> recWords = normalize(recognizedText);
        boolean[] matched = align(refWords, recWords);

        List<WordResult> results = new ArrayList<>();
        int correctCount = 0;
        for (int i = 0; i < refWords.size(); i++) {
            results.add(new WordResult(refWords.get(i), matched[i]));
            if (matched[i]) correctCount++;
        }
        int scorePercent = refWords.isEmpty() ? 0 : Math.round(100f * correctCount / refWords.size());
        return new ScoreResult(results, scorePercent);
    }

    private static List<String> normalize(String text) {
        if (text == null || text.isBlank()) return List.of();
        return Arrays.stream(text.toLowerCase().replaceAll("[^a-zäöüß\\s]", "").trim().split("\\s+"))
            .filter(w -> !w.isBlank())
            .toList();
    }

    // Standard Wagner-Fischer edit-distance alignment; backtrack marks each reference word as
    // matched only when it lines up with an identical recognized word (substitutions/deletions
    // count as mismatches).
    private static boolean[] align(List<String> ref, List<String> rec) {
        int n = ref.size();
        int m = rec.size();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                dp[i][j] = ref.get(i - 1).equals(rec.get(j - 1))
                    ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
            }
        }

        boolean[] matched = new boolean[n];
        int i = n;
        int j = m;
        while (i > 0 && j > 0) {
            if (ref.get(i - 1).equals(rec.get(j - 1))) {
                matched[i - 1] = true;
                i--;
                j--;
            } else if (dp[i][j] == dp[i - 1][j - 1] + 1) {
                matched[i - 1] = false;
                i--;
                j--;
            } else if (dp[i][j] == dp[i - 1][j] + 1) {
                matched[i - 1] = false;
                i--;
            } else {
                j--;
            }
        }
        return matched;
    }
}
