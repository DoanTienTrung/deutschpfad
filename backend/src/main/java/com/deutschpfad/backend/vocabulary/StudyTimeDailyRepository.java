package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudyTimeDailyRepository extends JpaRepository<StudyTimeDaily, Long> {
    Optional<StudyTimeDaily> findByUserAndStudyDate(User user, LocalDate studyDate);

    List<StudyTimeDaily> findByUserAndStudyDateGreaterThanEqual(User user, LocalDate fromDate);

    @Query("SELECT COALESCE(SUM(s.seconds), 0) FROM StudyTimeDaily s WHERE s.user = :user")
    long sumSecondsByUser(@Param("user") User user);
}
