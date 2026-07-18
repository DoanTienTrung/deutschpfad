package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserVocabularyRepository extends JpaRepository<UserVocabulary, Long> {

    Optional<UserVocabulary> findByUserAndVocabularyItem(User user, VocabularyItem vocabularyItem);

    List<UserVocabulary> findByUserAndNextReviewDateLessThanEqual(User user, LocalDate date);

    long countByUser(User user);

    long countByUserAndRepetitionsGreaterThanEqual(User user, int repetitions);

    long countByUserAndNextReviewDateLessThanEqual(User user, LocalDate date);
}
