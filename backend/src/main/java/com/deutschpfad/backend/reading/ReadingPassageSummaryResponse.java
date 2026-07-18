package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

public record ReadingPassageSummaryResponse(
    Long id,
    String title,
    VocabularyItem.Level levelMin,
    VocabularyItem.Level levelMax,
    String topic,
    String sourceLabel,
    int orderIndex,
    int questionCount,
    ReadingPassage.Category category,
    String imageUrl,
    String imageAttributionName,
    String imageAttributionUrl
) {
    public static ReadingPassageSummaryResponse from(ReadingPassage passage, int questionCount) {
        return new ReadingPassageSummaryResponse(
            passage.getId(),
            passage.getTitle(),
            passage.getLevelMin(),
            passage.getLevelMax(),
            passage.getTopic(),
            passage.getSourceLabel(),
            passage.getOrderIndex(),
            questionCount,
            passage.getCategory(),
            passage.getImageUrl(),
            passage.getImageAttributionName(),
            passage.getImageAttributionUrl()
        );
    }
}
