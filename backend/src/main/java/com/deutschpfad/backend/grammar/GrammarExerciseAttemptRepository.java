package com.deutschpfad.backend.grammar;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GrammarExerciseAttemptRepository extends JpaRepository<GrammarExerciseAttempt, Long> {

    /**
     * Bài tập bị trả lời sai nhiều nhất — dùng ở trang admin để soi bài soạn sai hoặc gây hiểu
     * nhầm. Chỉ tính bài có ít nhất 3 lượt làm để một hai lần sai lẻ không đẩy bài lên đầu.
     */
    @Query("""
        SELECT a.exercise.id, count(a), sum(CASE WHEN a.correct THEN 0 ELSE 1 END)
        FROM GrammarExerciseAttempt a
        GROUP BY a.exercise.id
        HAVING count(a) >= 3 AND sum(CASE WHEN a.correct THEN 0 ELSE 1 END) * 2 > count(a)
        ORDER BY sum(CASE WHEN a.correct THEN 0 ELSE 1 END) DESC
        """)
    List<Object[]> findMostFailedExercises();
}
