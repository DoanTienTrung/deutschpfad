package com.deutschpfad.backend.vocabulary;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VocabularyItemRepository extends JpaRepository<VocabularyItem, Long> {
    List<VocabularyItem> findByLevel(VocabularyItem.Level level);

    // Nguồn từ cho bộ sinh bài tập ngữ pháp deterministic: lấy đúng loại từ (Nomen/Verb) ở các
    // level không vượt quá level của chủ điểm, để bài tập chỉ dùng từ người học đã gặp.
    List<VocabularyItem> findByWordTypeIgnoreCaseAndLevelIn(String wordType, List<VocabularyItem.Level> levels);
    List<VocabularyItem> findByLessonId(Long lessonId);
    List<VocabularyItem> findByExampleSentenceIsNotNull();
    List<VocabularyItem> findByExampleSentenceIsNotNullAndExampleSentenceHighlightIsNull();

    // Hàng đợi ôn tập đã chuyển sang UserVocabularyRepository#findDue: lịch ôn giờ gắn với TỪ
    // (word_key), không gắn với dòng, nên truy vấn phải bắt đầu từ bảng lịch ôn.
}
