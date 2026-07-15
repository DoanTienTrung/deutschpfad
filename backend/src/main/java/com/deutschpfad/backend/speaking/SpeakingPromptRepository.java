package com.deutschpfad.backend.speaking;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpeakingPromptRepository extends JpaRepository<SpeakingPrompt, Long> {
    List<SpeakingPrompt> findByLevelOrderByOrderIndex(VocabularyItem.Level level);
}
