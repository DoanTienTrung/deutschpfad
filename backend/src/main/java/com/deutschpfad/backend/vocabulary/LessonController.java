package com.deutschpfad.backend.vocabulary;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonRepository lessonRepository;
    private final VocabularyItemRepository vocabularyItemRepository;
    private final VocabularyVisibility visibility;

    public LessonController(
        LessonRepository lessonRepository,
        VocabularyItemRepository vocabularyItemRepository,
        VocabularyVisibility visibility
    ) {
        this.lessonRepository = lessonRepository;
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.visibility = visibility;
    }

    @GetMapping
    public List<LessonSummaryResponse> list(
        @RequestParam(required = false) VocabularyItem.Level level,
        @RequestParam(required = false) Long topicId,
        @RequestParam(required = false, defaultValue = "FREQUENCY") VocabularyItem.Source source,
        Authentication authentication
    ) {
        // Không chọn cấp độ = lấy cả nguồn: bộ "Sống ở Đức" xếp theo tình huống, mỗi bài một cấp độ.
        List<Lesson> lessons = topicId != null
            ? lessonRepository.findByTopicIdOrderByOrderIndex(topicId)
            : level != null
                ? lessonRepository.findByLevelAndSourceOrderByOrderIndex(level, source)
                : lessonRepository.findBySourceOrderByOrderIndex(source);

        return lessons.stream()
            .filter(lesson -> visibility.canSee(lesson.getSource(), authentication))
            .map(lesson -> LessonSummaryResponse.from(
                lesson, vocabularyItemRepository.findByLessonId(lesson.getId()).size()
            ))
            .toList();
    }

    @GetMapping("/{id}")
    public LessonSummaryResponse get(@PathVariable Long id, Authentication authentication) {
        Lesson lesson = visibleLesson(id, authentication);
        return LessonSummaryResponse.from(lesson, vocabularyItemRepository.findByLessonId(id).size());
    }

    @GetMapping("/{id}/vocabulary-items")
    public List<VocabularyItemResponse> vocabularyItems(@PathVariable Long id, Authentication authentication) {
        visibleLesson(id, authentication);
        return vocabularyItemRepository.findByLessonIdOrderByIdAsc(id).stream()
            .map(VocabularyItemResponse::from)
            .toList();
    }

    // Bài đang ẩn trả 404 như bài không tồn tại — chặn cả người đã lưu link /app/practice/{id}.
    private Lesson visibleLesson(Long id, Authentication authentication) {
        return lessonRepository.findById(id)
            .filter(lesson -> visibility.canSee(lesson.getSource(), authentication))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài học"));
    }
}
