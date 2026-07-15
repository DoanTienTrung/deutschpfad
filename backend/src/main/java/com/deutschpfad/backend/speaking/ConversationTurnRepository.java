package com.deutschpfad.backend.speaking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationTurnRepository extends JpaRepository<ConversationTurn, Long> {
    List<ConversationTurn> findByRecordingIdOrderByTurnIndex(Long recordingId);
}
