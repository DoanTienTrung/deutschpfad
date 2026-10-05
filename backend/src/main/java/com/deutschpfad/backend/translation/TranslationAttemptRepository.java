package com.deutschpfad.backend.translation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface TranslationAttemptRepository extends JpaRepository<TranslationAttempt, Long> {

    long countByUserIdAndJudgedByAndCreatedAtAfter(Long userId, TranslationAttempt.JudgedBy judgedBy, LocalDateTime after);

    /** Lần làm gần nhất của người học cho từng câu trong một bộ: [itemId, verdict]. */
    @Query("""
        SELECT a.itemId, a.verdict FROM TranslationAttempt a
         WHERE a.userId = :userId
           AND a.itemId IN (SELECT i.id FROM TranslationItem i WHERE i.set.id = :setId)
           AND a.createdAt = (SELECT MAX(b.createdAt) FROM TranslationAttempt b WHERE b.userId = a.userId AND b.itemId = a.itemId)""")
    List<Object[]> latestVerdictsInSet(@Param("userId") Long userId, @Param("setId") Long setId);

    default Map<Long, TranslationAttempt.Verdict> latestVerdictMap(Long userId, Long setId) {
        Map<Long, TranslationAttempt.Verdict> map = new HashMap<>();
        for (Object[] row : latestVerdictsInSet(userId, setId)) map.put((Long) row[0], (TranslationAttempt.Verdict) row[1]);
        return map;
    }

    /** Số câu đã từng làm đúng (đúng hoặc gần đúng) theo từng bộ: [setId, count]. */
    @Query("""
        SELECT i.set.id, COUNT(DISTINCT a.itemId) FROM TranslationAttempt a, TranslationItem i
         WHERE a.itemId = i.id AND a.userId = :userId
           AND a.verdict IN (com.deutschpfad.backend.translation.TranslationAttempt.Verdict.CORRECT,
                             com.deutschpfad.backend.translation.TranslationAttempt.Verdict.ALMOST)
         GROUP BY i.set.id""")
    List<Object[]> passedCountPerSet(@Param("userId") Long userId);

    default Map<Long, Integer> passedCountMap(Long userId) {
        Map<Long, Integer> map = new HashMap<>();
        for (Object[] row : passedCountPerSet(userId)) map.put((Long) row[0], ((Long) row[1]).intValue());
        return map;
    }
}
