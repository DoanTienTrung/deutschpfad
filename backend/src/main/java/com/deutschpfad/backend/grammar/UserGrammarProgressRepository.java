package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserGrammarProgressRepository extends JpaRepository<UserGrammarProgress, Long> {
    Optional<UserGrammarProgress> findByUserAndTopic(User user, GrammarTopic topic);

    List<UserGrammarProgress> findByUser(User user);
}
