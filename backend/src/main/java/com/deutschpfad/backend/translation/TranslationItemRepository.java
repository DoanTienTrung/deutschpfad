package com.deutschpfad.backend.translation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface TranslationItemRepository extends JpaRepository<TranslationItem, Long> {
    List<TranslationItem> findBySetIdOrderByOrderIndexAscIdAsc(Long setId);

    @Query("SELECT i.set.id, COUNT(i) FROM TranslationItem i GROUP BY i.set.id")
    List<Object[]> countPerSet();

    default Map<Long, Integer> countMapBySet() {
        Map<Long, Integer> counts = new HashMap<>();
        for (Object[] row : countPerSet()) counts.put((Long) row[0], ((Long) row[1]).intValue());
        return counts;
    }
}
