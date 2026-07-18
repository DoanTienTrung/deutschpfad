package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.vocabulary.VocabularyItem;

import java.util.List;

public record ReadingPassageDetailResponse(
    Long id,
    String title,
    VocabularyItem.Level levelMin,
    VocabularyItem.Level levelMax,
    String topic,
    String sourceLabel,
    String sourceUrl,
    String content,
    String contentTranslation,
    ReadingPassage.Category category,
    String imageUrl,
    String imageAttributionName,
    String imageAttributionUrl,
    List<ReadingQuestionPracticeResponse> questions,
    List<ReadingMatchingOptionResponse> matchingOptions
) {
    public static ReadingPassageDetailResponse from(
        ReadingPassage passage, List<ReadingQuestion> questions, List<ReadingMatchingOption> matchingOptions
    ) {
        return new ReadingPassageDetailResponse(
            passage.getId(),
            passage.getTitle(),
            passage.getLevelMin(),
            passage.getLevelMax(),
            passage.getTopic(),
            passage.getSourceLabel(),
            passage.getSourceUrl(),
            passage.getContent(),
            passage.getContentTranslation(),
            passage.getCategory(),
            passage.getImageUrl(),
            passage.getImageAttributionName(),
            passage.getImageAttributionUrl(),
            questions.stream().map(ReadingQuestionPracticeResponse::from).toList(),
            matchingOptions.stream().map(ReadingMatchingOptionResponse::from).toList()
        );
    }
}
