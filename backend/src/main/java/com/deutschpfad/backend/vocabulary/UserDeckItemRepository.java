package com.deutschpfad.backend.vocabulary;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDeckItemRepository extends JpaRepository<UserDeckItem, Long> {
    List<UserDeckItem> findByDeckId(Long deckId);
}
