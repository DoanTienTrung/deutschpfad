package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VocabularyItemRepository extends JpaRepository<VocabularyItem, Long> {
    List<VocabularyItem> findByLevel(VocabularyItem.Level level);
    List<VocabularyItem> findByLessonId(Long lessonId);

    @Query("""
        SELECT v FROM VocabularyItem v
        LEFT JOIN UserVocabulary uv ON uv.vocabularyItem = v AND uv.user = :user
        WHERE uv.id IS NULL OR uv.nextReviewDate <= CURRENT_DATE
        """)
    List<VocabularyItem> findDueForReview(@Param("user") User user);
}
