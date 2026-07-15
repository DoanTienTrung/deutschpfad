package com.deutschpfad.backend.speaking;

import com.deutschpfad.backend.listening.DeepgramTranscriptionService;

import java.util.List;

public record SpeakingSubmissionResponse(
    boolean available, String transcript, List<DeepgramTranscriptionService.WordConfidence> words, String feedback
) {
    public static SpeakingSubmissionResponse unavailable() {
        return new SpeakingSubmissionResponse(false, null, List.of(), null);
    }
}
