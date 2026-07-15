package com.deutschpfad.backend.listening;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserListeningSentenceRepository extends JpaRepository<UserListeningSentence, Long> {
    List<UserListeningSentence> findByItemIdOrderByOrderIndex(Long itemId);

    @Modifying
    @Transactional
    @Query("DELETE FROM UserListeningSentence s WHERE s.item.id = :itemId")
    void deleteByItemId(@Param("itemId") Long itemId);
}
