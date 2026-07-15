package com.deutschpfad.backend.speaking;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRecordingRepository extends JpaRepository<UserRecording, Long> {
    List<UserRecording> findByUserAndPromptIdOrderByCreatedAtDesc(User user, Long promptId);
}
