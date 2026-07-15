package com.deutschpfad.backend.listening;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListeningExerciseRepository extends JpaRepository<ListeningExercise, Long> {
    List<ListeningExercise> findAllByOrderByOrderIndex();
}
