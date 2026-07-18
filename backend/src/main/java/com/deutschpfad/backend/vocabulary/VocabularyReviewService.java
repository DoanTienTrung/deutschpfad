package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VocabularyReviewService {

    /** SM2 repetitions count at which a word is considered "remembered" (past the 1-day/6-day bootstrap). */
    private static final int REMEMBERED_MIN_REPETITIONS = 2;

    private final VocabularyItemRepository vocabularyItemRepository;
    private final UserVocabularyRepository userVocabularyRepository;
    private final LearningStreakService learningStreakService;
    
    public VocabularyReviewService(
        VocabularyItemRepository vocabularyItemRepository,
        UserVocabularyRepository userVocabularyRepository,
        LearningStreakService learningStreakService
    ) {
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.userVocabularyRepository = userVocabularyRepository;
        this.learningStreakService = learningStreakService;
    }

    public List<VocabularyItemResponse> getDueCards(User user) {
        return vocabularyItemRepository.findDueForReview(user).stream()
            .map(VocabularyItemResponse::from)
            .toList();
    }

    public VocabularyStatsResponse getStats(User user) {
        long learned = userVocabularyRepository.countByUser(user);
        long remembered = userVocabularyRepository.countByUserAndRepetitionsGreaterThanEqual(user, REMEMBERED_MIN_REPETITIONS);
        long dueForReview = userVocabularyRepository.countByUserAndNextReviewDateLessThanEqual(user, LocalDate.now());
        return new VocabularyStatsResponse(learned, remembered, dueForReview);
    }

    public ReviewResultResponse submitReview(User user, Long vocabularyItemId, ReviewQuality quality) {
        VocabularyItem item = vocabularyItemRepository.findById(vocabularyItemId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng"));

        UserVocabulary uv = userVocabularyRepository.findByUserAndVocabularyItem(user, item)
            .orElseGet(() -> {
                UserVocabulary created = new UserVocabulary();
                created.setUser(user);
                created.setVocabularyItem(item);
                return created;
            });

        Sm2Calculator.Result result = Sm2Calculator.calculate(
            uv.getRepetitions(), uv.getEaseFactor(), uv.getIntervalDays(), quality.getQuality()
        );

        uv.setRepetitions(result.repetitions());
        uv.setEaseFactor(result.easeFactor());
        uv.setIntervalDays(result.intervalDays());
        uv.setNextReviewDate(result.nextReviewDate());
        uv.setLastReviewedAt(LocalDateTime.now());
        userVocabularyRepository.save(uv);
        learningStreakService.recordActivity(user);

        return new ReviewResultResponse(
            uv.getRepetitions(), uv.getEaseFactor(), uv.getIntervalDays(), uv.getNextReviewDate()
        );
    }
}
