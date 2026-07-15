package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDeckRepository extends JpaRepository<UserDeck, Long> {
    List<UserDeck> findByUser(User user);
}
