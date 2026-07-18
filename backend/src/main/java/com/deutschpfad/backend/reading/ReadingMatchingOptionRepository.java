package com.deutschpfad.backend.reading;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ReadingMatchingOptionRepository extends JpaRepository<ReadingMatchingOption, Long> {
    List<ReadingMatchingOption> findByPassageIdOrderByOrderIndex(Long passageId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ReadingMatchingOption o WHERE o.passage.id = :passageId")
    void deleteByPassageId(@Param("passageId") Long passageId);
}
