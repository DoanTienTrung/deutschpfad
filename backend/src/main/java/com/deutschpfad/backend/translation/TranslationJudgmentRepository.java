package com.deutschpfad.backend.translation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TranslationJudgmentRepository extends JpaRepository<TranslationJudgment, Long> {
    Optional<TranslationJudgment> findByItemIdAndAnswerKey(Long itemId, String answerKey);
}
