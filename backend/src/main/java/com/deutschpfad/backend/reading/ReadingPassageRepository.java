package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReadingPassageRepository extends JpaRepository<ReadingPassage, Long> {
    List<ReadingPassage> findAllByOrderByOrderIndex();
    List<ReadingPassage> findByOwnerIsNullOrderByOrderIndex();
    List<ReadingPassage> findByOwnerOrderByCreatedAtDesc(User owner);
}
