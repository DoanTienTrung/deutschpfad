package com.deutschpfad.backend.vocabulary;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vocabulary-items")
@PreAuthorize("hasRole('ADMIN')")
public class VocabularyItemAdminController {

    private final VocabularyItemRepository vocabularyItemRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;

    public VocabularyItemAdminController(
        VocabularyItemRepository vocabularyItemRepository,
        TopicRepository topicRepository,
        LessonRepository lessonRepository
    ) {
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.topicRepository = topicRepository;
        this.lessonRepository = lessonRepository;
    }

    @GetMapping
    public List<VocabularyItemResponse> list() {
        return vocabularyItemRepository.findAll().stream()
            .map(VocabularyItemResponse::from)
            .toList();
    }

    @PostMapping
    public ResponseEntity<VocabularyItemResponse> create(@Valid @RequestBody VocabularyItemRequest request) {
        VocabularyItem item = new VocabularyItem();
        applyRequest(item, request);
        return ResponseEntity.ok(VocabularyItemResponse.from(vocabularyItemRepository.save(item)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VocabularyItemResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody VocabularyItemRequest request
    ) {
        VocabularyItem item = vocabularyItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy từ vựng"));
        applyRequest(item, request);
        return ResponseEntity.ok(VocabularyItemResponse.from(vocabularyItemRepository.save(item)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vocabularyItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(VocabularyItem item, VocabularyItemRequest request) {
        item.setGermanWord(request.germanWord());
        item.setVietnameseMeaning(request.vietnameseMeaning());
        item.setEnglishMeaning(request.englishMeaning());
        item.setPhonetic(request.phonetic());
        item.setWordType(request.wordType());
        item.setExampleSentence(request.exampleSentence());
        item.setImageUrl(request.imageUrl());
        item.setLevel(request.level());
        item.setSource(request.source() != null ? request.source() : VocabularyItem.Source.FREQUENCY);
        item.setTopic(request.topicId() != null
            ? topicRepository.findById(request.topicId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy topic"))
            : null);
        item.setLesson(request.lessonId() != null
            ? lessonRepository.findById(request.lessonId()).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lesson"))
            : null);
    }
}
