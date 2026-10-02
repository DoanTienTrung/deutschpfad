package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserVocabularyRepository extends JpaRepository<UserVocabulary, Long> {
    Optional<UserVocabulary> findByUserAndWordKey(User user, String wordKey);

    /**
     * Thẻ đến hạn ôn, TỪ QUÁ HẠN LÂU NHẤT trở đi, giới hạn theo {@code page}.
     *
     * <p>Trước đây trả MỌI thẻ đến hạn và không sắp xếp: nghỉ một tuần quay lại là phải đối mặt cả
     * trăm thẻ trong một lượt, theo thứ tự ngẫu nhiên — dễ bỏ ngang, và thẻ cần ôn gấp nhất có thể
     * nằm tận cuối. Hoà ngày thì ưu tiên hệ số dễ thấp (từ khó nhớ hơn) lên trước.
     */
    @Query("""
        SELECT uv FROM UserVocabulary uv
          JOIN FETCH uv.vocabularyItem
         WHERE uv.user = :user AND uv.nextReviewDate <= :today
         ORDER BY uv.nextReviewDate ASC, uv.easeFactor ASC, uv.id ASC
        """)
    List<UserVocabulary> findDue(@Param("user") User user, @Param("today") LocalDate today, Pageable page);

    long countByUser(User user);
    long countByUserAndRepetitionsGreaterThanEqual(User user, int repetitions);
    long countByUserAndNextReviewDateLessThanEqual(User user, LocalDate date);
}
