package com.deutschpfad.backend.reading;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface ReadingWordTranslationRepository extends JpaRepository<ReadingWordTranslation, Long> {
    Optional<ReadingWordTranslation> findByPassageIdAndWord(Long passageId, String word);

    @Modifying
    @Transactional
    @Query("DELETE FROM ReadingWordTranslation t WHERE t.passage.id = :passageId")
    void deleteByPassageId(@Param("passageId") Long passageId);
}
