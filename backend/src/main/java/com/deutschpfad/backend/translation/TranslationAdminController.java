package com.deutschpfad.backend.translation;

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
