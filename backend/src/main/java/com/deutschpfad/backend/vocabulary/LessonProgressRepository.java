package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByUserAndLessonId(User user, Long lessonId);
    Optional<LessonProgress> findByUserAndLessonIdAndMode(User user, Long lessonId, PracticeMode mode);
    List<LessonProgress> findByUser(User user);

    @Query("""
        SELECT lp.lesson.source AS source, lp.lesson.level AS level, COUNT(DISTINCT lp.lesson.id) AS count
        FROM LessonProgress lp
        WHERE lp.user = :user AND lp.mode = :mode
        GROUP BY lp.lesson.source, lp.lesson.level
        """)
    List<SourceLevelCount> countCompletedLessonsBySourceAndLevel(@Param("user") User user, @Param("mode") PracticeMode mode);

    @Query("""
        SELECT CAST(lp.completedAt AS date) AS day, COUNT(DISTINCT lp.lesson.id) AS count
        FROM LessonProgress lp
        WHERE lp.user = :user AND lp.mode = :mode AND lp.completedAt >= :since
        GROUP BY CAST(lp.completedAt AS date)
        """)
    List<DailyCompletionCount> countCompletedLessonsByDay(
        @Param("user") User user, @Param("mode") PracticeMode mode, @Param("since") LocalDateTime since
    );
}
