package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/translation")
@PreAuthorize("hasRole('ADMIN')")
public class TranslationAdminController {

    private final TranslationAdminService adminService;

    public TranslationAdminController(TranslationAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/grammar-topics")
    public List<TranslationAdminService.GrammarTopicRow> grammarTopics() {
        return adminService.grammarTopics();
    }

    /** Bài theo chủ đề của một dạng: COLLOCATION, PARAGRAPH, ESSAY. */
    @GetMapping("/sets")
    public List<TranslationAdminService.SetRow> themedSets(@RequestParam TranslationSet.Type type) {
        return adminService.themedSets(type);
    }

    @PostMapping("/sets")
    public TranslationAdminService.SetData create(@RequestBody TranslationAdminService.NewSet request) {
        return adminService.create(request);
    }

    @PostMapping("/sets/generate")
    public TranslationAdminService.SetData generateThemed(
        @RequestParam TranslationSet.Type type,
        @RequestParam VocabularyItem.Level level,
        @RequestParam String theme,
        @RequestParam(defaultValue = "10") int count
    ) {
        return adminService.generateThemed(type, level, theme, Math.max(3, Math.min(16, count)));
    }

    @GetMapping("/sets/{id}")
    public TranslationAdminService.SetData get(@PathVariable Long id) {
        return adminService.get(id);
    }

    @PostMapping("/grammar-topics/{topicId}/generate")
    public TranslationAdminService.SetData generate(@PathVariable Long topicId, @RequestParam(defaultValue = "10") int count) {
        return adminService.generateForGrammarTopic(topicId, Math.max(1, Math.min(20, count)));
    }

    @PutMapping("/sets/{id}")
    public TranslationAdminService.SetData update(@PathVariable Long id, @RequestBody TranslationAdminService.SetUpdate update) {
        return adminService.update(id, update);
    }

    @DeleteMapping("/sets/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
