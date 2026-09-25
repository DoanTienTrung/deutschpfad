package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserGrammarProgressRepository extends JpaRepository<UserGrammarProgress, Long> {
    Optional<UserGrammarProgress> findByUserAndTopic(User user, GrammarTopic topic);

    List<UserGrammarProgress> findByUser(User user);

    /** Chủ điểm đã đến hạn ôn lại, cũ nhất trước. */
    List<UserGrammarProgress> findByUserAndNextReviewDateLessThanEqualOrderByNextReviewDate(
        User user, LocalDate date);
}
