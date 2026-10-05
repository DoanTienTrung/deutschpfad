package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TranslationSetRepository extends JpaRepository<TranslationSet, Long> {
    List<TranslationSet> findByTypeAndLevelAndStatusOrderByOrderIndexAscIdAsc(
        TranslationSet.Type type, VocabularyItem.Level level, TranslationSet.Status status);

    List<TranslationSet> findByTypeOrderByLevelAscOrderIndexAscIdAsc(TranslationSet.Type type);

    Optional<TranslationSet> findByGrammarTopicId(Long grammarTopicId);

    Optional<TranslationSet> findFirstByGrammarTopic_SlugAndStatus(String slug, TranslationSet.Status status);
}
