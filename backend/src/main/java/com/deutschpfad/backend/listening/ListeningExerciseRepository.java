package com.deutschpfad.backend.listening;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ListeningExerciseRepository extends JpaRepository<ListeningExercise, Long> {
    List<ListeningExercise> findAllByOrderByOrderIndex();

    List<ListeningExercise> findByStatusOrderByOrderIndex(ListeningExercise.Status status);

    List<ListeningExercise> findByKindAndStatusOrderByOrderIndexAscIdAsc(ListeningExercise.Kind kind, ListeningExercise.Status status);

    List<ListeningExercise> findByStatusOrderByIdAsc(ListeningExercise.Status status, Pageable pageable);

    List<ListeningExercise> findByStatusOrderByIdAsc(ListeningExercise.Status status);

    long countByStatus(ListeningExercise.Status status);

    @Query("SELECT e.youtubeVideoId FROM ListeningExercise e WHERE e.kind = com.deutschpfad.backend.listening.ListeningExercise.Kind.YOUTUBE AND e.youtubeVideoId IS NOT NULL")
    List<String> findYoutubeVideoIds();

    @Query("SELECT e.status, COUNT(e) FROM ListeningExercise e WHERE e.kind = com.deutschpfad.backend.listening.ListeningExercise.Kind.YOUTUBE GROUP BY e.status")
    List<Object[]> countYoutubeByStatus();

    /** Video đã hiện cho người học nhưng còn thiếu kênh hoặc thời lượng (bài nhập tay trước khi có kênh). */
    @Query("""
        SELECT e FROM ListeningExercise e
         WHERE e.kind = com.deutschpfad.backend.listening.ListeningExercise.Kind.YOUTUBE
           AND e.status = com.deutschpfad.backend.listening.ListeningExercise.Status.READY
           AND e.youtubeVideoId IS NOT NULL
           AND (e.channel IS NULL OR e.durationSeconds IS NULL OR e.durationSeconds = 0)
         ORDER BY e.id""")
    List<ListeningExercise> findReadyYoutubeMissingMetadata();
}
