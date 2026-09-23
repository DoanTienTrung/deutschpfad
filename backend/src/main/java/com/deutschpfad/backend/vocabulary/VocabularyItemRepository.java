package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VocabularyItemRepository extends JpaRepository<VocabularyItem, Long> {
    List<VocabularyItem> findByLevel(VocabularyItem.Level level);

    // Nguồn từ cho bộ sinh bài tập ngữ pháp deterministic: lấy đúng loại từ (Nomen/Verb) ở các
    // level không vượt quá level của chủ điểm, để bài tập chỉ dùng từ người học đã gặp.
    List<VocabularyItem> findByWordTypeIgnoreCaseAndLevelIn(String wordType, List<VocabularyItem.Level> levels);
    List<VocabularyItem> findByLessonId(Long lessonId);
    List<VocabularyItem> findByExampleSentenceIsNotNull();
    List<VocabularyItem> findByExampleSentenceIsNotNullAndExampleSentenceHighlightIsNull();

    // Only words the user has studied before and whose SM2 schedule says are due again today —
    // matches VocabularyReviewService.getStats()'s "dueForReview" count exactly. Never-studied
    // words are a separate concept ("chưa học", browsed via lessons/decks), not part of this queue.
    @Query("""
        SELECT v FROM VocabularyItem v
        JOIN UserVocabulary uv ON uv.vocabularyItem = v AND uv.user = :user
        WHERE uv.nextReviewDate <= CURRENT_DATE
        """)
    List<VocabularyItem> findDueForReview(@Param("user") User user);
}
