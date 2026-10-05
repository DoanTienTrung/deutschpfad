package com.deutschpfad.backend.listening;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface ListeningSentenceRepository extends JpaRepository<ListeningSentence, Long> {
    List<ListeningSentence> findByExerciseIdOrderByOrderIndex(Long exerciseId);

    /** Số câu của mọi bài trong một truy vấn: [exerciseId, count]. Danh sách bài không cần nạp cả câu. */
    @Query("SELECT s.exercise.id, COUNT(s) FROM ListeningSentence s GROUP BY s.exercise.id")
    List<Object[]> countPerExercise();

    default Map<Long, Integer> countMapByExercise() {
        Map<Long, Integer> counts = new HashMap<>();
        for (Object[] row : countPerExercise()) counts.put((Long) row[0], ((Long) row[1]).intValue());
        return counts;
    }

    /**
     * Câu chưa dịch của các bài đang chờ dịch, có id lớn hơn {@code afterId}: job đi tới một lượt, nên câu
     * Groq bỏ trống không bị lấy lại mãi trong cùng lượt.
     */
    @Query("""
        SELECT s FROM ListeningSentence s
         WHERE s.exercise.status = com.deutschpfad.backend.listening.ListeningExercise.Status.TRANSLATING
           AND (s.translation IS NULL OR TRIM(s.translation) = '')
           AND s.id > :afterId
         ORDER BY s.id""")
    List<ListeningSentence> findUntranslatedOfTranslatingExercisesAfter(@Param("afterId") long afterId, Pageable pageable);

    long countByExerciseId(Long exerciseId);

    @Query("""
        SELECT COUNT(s) FROM ListeningSentence s
         WHERE s.exercise.status = com.deutschpfad.backend.listening.ListeningExercise.Status.TRANSLATING
           AND (s.translation IS NULL OR TRIM(s.translation) = '')""")
    long countUntranslatedOfTranslatingExercises();

    @Query("""
        SELECT COUNT(s) FROM ListeningSentence s
         WHERE s.exercise.id = :exerciseId AND (s.translation IS NULL OR TRIM(s.translation) = '')""")
    long countUntranslated(@Param("exerciseId") Long exerciseId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ListeningSentence s WHERE s.exercise.id = :exerciseId")
    void deleteByExerciseId(@Param("exerciseId") Long exerciseId);
}
