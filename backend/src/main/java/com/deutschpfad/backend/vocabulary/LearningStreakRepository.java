package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LearningStreakRepository extends JpaRepository<LearningStreak, Long> {
    Optional<LearningStreak> findByUser(User user);
}
