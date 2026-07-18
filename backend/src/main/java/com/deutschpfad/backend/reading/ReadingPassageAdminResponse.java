package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

import java.util.List;

public record ReadingPassageAdminResponse(
    Long id,
    String title,
    VocabularyItem.Level levelMin,
    VocabularyItem.Level levelMax,
    String topic,
    String sourceLabel,
    String sourceUrl,
    int orderIndex,
    String content,
    ReadingPassage.Category category,
    String imageUrl,
    String imageAttributionName,
    String imageAttributionUrl,
    List<ReadingQuestionAdminResponse> questions,
    List<ReadingMatchingOptionResponse> matchingOptions
) {
    public static ReadingPassageAdminResponse from(
        ReadingPassage passage, List<ReadingQuestion> questions, List<ReadingMatchingOption> matchingOptions
    ) {
        return new ReadingPassageAdminResponse(
            passage.getId(),
            passage.getTitle(),
            passage.getLevelMin(),
            passage.getLevelMax(),
            passage.getTopic(),
            passage.getSourceLabel(),
            passage.getSourceUrl(),
            passage.getOrderIndex(),
            passage.getContent(),
            passage.getCategory(),
            passage.getImageUrl(),
            passage.getImageAttributionName(),
            passage.getImageAttributionUrl(),
            questions.stream().map(ReadingQuestionAdminResponse::from).toList(),
            matchingOptions.stream().map(ReadingMatchingOptionResponse::from).toList()
        );
    }
}
