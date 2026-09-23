package com.deutschpfad.backend.grammar;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface GrammarExerciseRepository extends JpaRepository<GrammarExercise, Long> {

    List<GrammarExercise> findByTopicIdOrderByOrderIndex(Long topicId);

    // Chỉ bài đã duyệt mới tới tay người học -- bài AI sinh ra (reviewed = false) bị loại ở đây.
    List<GrammarExercise> findByTopicIdAndReviewedTrueOrderByOrderIndex(Long topicId);

    int countByTopicIdAndReviewedTrue(Long topicId);

    @Modifying
    @Transactional
    @Query("DELETE FROM GrammarExercise e WHERE e.topic.id = :topicId")
    void deleteByTopicId(@Param("topicId") Long topicId);
}
