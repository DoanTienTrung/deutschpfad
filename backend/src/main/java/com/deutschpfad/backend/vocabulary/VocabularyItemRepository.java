package com.deutschpfad.backend.vocabulary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VocabularyItemRepository extends JpaRepository<VocabularyItem, Long> {
    List<VocabularyItem> findByLevel(VocabularyItem.Level level);

    // Nguồn từ cho bộ sinh bài tập ngữ pháp deterministic: lấy đúng loại từ (Nomen/Verb) ở các
    // level không vượt quá level của chủ điểm, để bài tập chỉ dùng từ người học đã gặp.
    List<VocabularyItem> findByWordTypeIgnoreCaseAndLevelIn(String wordType, List<VocabularyItem.Level> levels);
    List<VocabularyItem> findByLessonId(Long lessonId);
    // Thứ tự soạn bài: không có ORDER BY thì Postgres trả theo vị trí vật lý, đổi sau mỗi lần UPDATE
    // (vd. tính lại số nhiều) — từ trong bài bị xáo lộn mỗi lần dữ liệu được sửa.
    List<VocabularyItem> findByLessonIdOrderByIdAsc(Long lessonId);
    List<VocabularyItem> findByWordKey(String wordKey);

    // Hàng đợi của ExampleTranslationJob: có câu ví dụ mà chưa có bản dịch.
    @Query("SELECT v.id FROM VocabularyItem v WHERE v.exampleSentence IS NOT NULL AND v.exampleSentence <> '' "
        + "AND v.exampleSentenceVi IS NULL ORDER BY v.id")
    List<Long> findIdsMissingExampleTranslation();

    // Câu đã dịch, để dùng lại cho dòng khác có CÙNG câu (cùng từ ở nhiều lộ trình) thay vì gọi AI.
    @Query("SELECT v.exampleSentence, v.exampleSentenceVi FROM VocabularyItem v WHERE v.exampleSentenceVi IS NOT NULL")
    List<Object[]> findTranslatedExamples();
    List<VocabularyItem> findByExampleSentenceIsNotNull();
    List<VocabularyItem> findByExampleSentenceIsNotNullAndExampleSentenceHighlightIsNull();

    // Hàng đợi ôn tập đã chuyển sang UserVocabularyRepository#findDue: lịch ôn giờ gắn với TỪ
    // (word_key), không gắn với dòng, nên truy vấn phải bắt đầu từ bảng lịch ôn.
}
