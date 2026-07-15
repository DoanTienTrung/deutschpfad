package com.deutschpfad.backend.vocabulary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByLevelOrderByOrderIndex(VocabularyItem.Level level);
    List<Lesson> findByLevelAndSourceOrderByOrderIndex(VocabularyItem.Level level, VocabularyItem.Source source);
    List<Lesson> findByTopicIdOrderByOrderIndex(Long topicId);

    @Query("SELECT l.source AS source, l.level AS level, COUNT(l) AS count FROM Lesson l GROUP BY l.source, l.level")
    List<SourceLevelCount> countLessonsBySourceAndLevel();
}
