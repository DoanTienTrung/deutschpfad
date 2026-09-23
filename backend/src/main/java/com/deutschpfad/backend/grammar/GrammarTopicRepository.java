package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GrammarTopicRepository extends JpaRepository<GrammarTopic, Long> {
    List<GrammarTopic> findAllByOrderByLevelAscOrderIndexAsc();

    List<GrammarTopic> findByLevelOrderByOrderIndex(VocabularyItem.Level level);

    Optional<GrammarTopic> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
