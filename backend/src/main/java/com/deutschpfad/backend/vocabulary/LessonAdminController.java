package com.deutschpfad.backend.vocabulary;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/lessons")
@PreAuthorize("hasRole('ADMIN')")
public class LessonAdminController {

    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;

    public LessonAdminController(LessonRepository lessonRepository, TopicRepository topicRepository) {
        this.lessonRepository = lessonRepository;
        this.topicRepository = topicRepository;
    }

    @GetMapping
    public List<LessonResponse> list() {
        return lessonRepository.findAll().stream().map(LessonResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<LessonResponse> create(@Valid @RequestBody LessonRequest request) {
        Lesson lesson = new Lesson();
        applyRequest(lesson, request);
        return ResponseEntity.ok(LessonResponse.from(lessonRepository.save(lesson)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonResponse> update(@PathVariable Long id, @Valid @RequestBody LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lesson"));
        applyRequest(lesson, request);
        return ResponseEntity.ok(LessonResponse.from(lessonRepository.save(lesson)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        lessonRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(Lesson lesson, LessonRequest request) {
        lesson.setTitle(request.title());
        lesson.setLevel(request.level());
        lesson.setSource(request.source() != null ? request.source() : VocabularyItem.Source.FREQUENCY);
        lesson.setOrderIndex(request.orderIndex());
        lesson.setDescription(request.description());
        lesson.setTopic(request.topicId() != null
            ? topicRepository.findById(request.topicId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy topic"))
            : null);
    }
}
