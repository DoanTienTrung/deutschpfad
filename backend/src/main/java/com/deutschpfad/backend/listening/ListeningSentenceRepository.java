package com.deutschpfad.backend.listening;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ListeningSentenceRepository extends JpaRepository<ListeningSentence, Long> {
    List<ListeningSentence> findByExerciseIdOrderByOrderIndex(Long exerciseId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ListeningSentence s WHERE s.exercise.id = :exerciseId")
    void deleteByExerciseId(@Param("exerciseId") Long exerciseId);
}
