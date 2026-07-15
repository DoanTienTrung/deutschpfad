package com.deutschpfad.backend.speaking;

import java.time.LocalDateTime;
import java.util.List;

public record RecordingHistoryResponse(
    Long id, String transcript, String feedback, LocalDateTime createdAt, List<TurnResponse> turns
) {
    public record TurnResponse(Long id, String role, String text) {
        public static TurnResponse from(ConversationTurn turn) {
            return new TurnResponse(turn.getId(), turn.getRole().name(), turn.getText());
        }
    }

    public static RecordingHistoryResponse from(UserRecording recording, List<ConversationTurn> turns) {
        return new RecordingHistoryResponse(
            recording.getId(),
            recording.getTranscript(),
            recording.getFeedback(),
            recording.getCreatedAt(),
            turns.stream().map(TurnResponse::from).toList()
        );
    }
}
