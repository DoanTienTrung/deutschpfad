package com.deutschpfad.backend.vocabulary;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonRepository lessonRepository;
    private final VocabularyItemRepository vocabularyItemRepository;

    public LessonController(
        LessonRepository lessonRepository,
        VocabularyItemRepository vocabularyItemRepository
    ) {
        this.lessonRepository = lessonRepository;
        this.vocabularyItemRepository = vocabularyItemRepository;
    }

    @GetMapping
    public List<LessonSummaryResponse> list(
        @RequestParam(required = false) VocabularyItem.Level level,
        @RequestParam(required = false) Long topicId,
        @RequestParam(required = false, defaultValue = "FREQUENCY") VocabularyItem.Source source
    ) {
        List<Lesson> lessons = topicId != null
            ? lessonRepository.findByTopicIdOrderByOrderIndex(topicId)
            : lessonRepository.findByLevelAndSourceOrderByOrderIndex(level, source);

        return lessons.stream()
            .map(lesson -> LessonSummaryResponse.from(
                lesson, vocabularyItemRepository.findByLessonId(lesson.getId()).size()
            ))
            .toList();
    }

    @GetMapping("/{id}")
    public LessonSummaryResponse get(@PathVariable Long id) {
        Lesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài học"));
        return LessonSummaryResponse.from(lesson, vocabularyItemRepository.findByLessonId(id).size());
    }

    @GetMapping("/{id}/vocabulary-items")
    public List<VocabularyItemResponse> vocabularyItems(@PathVariable Long id) {
        return vocabularyItemRepository.findByLessonId(id).stream()
            .map(VocabularyItemResponse::from)
            .toList();
    }
}
