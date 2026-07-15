package com.deutschpfad.backend.speaking;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/speaking-prompts")
@PreAuthorize("hasRole('ADMIN')")
public class SpeakingPromptAdminController {

    private final SpeakingPromptRepository promptRepository;

    public SpeakingPromptAdminController(SpeakingPromptRepository promptRepository) {
        this.promptRepository = promptRepository;
    }

    @GetMapping
    public List<SpeakingPromptResponse> list() {
        return promptRepository.findAll().stream().map(SpeakingPromptResponse::from).toList();
    }

    @GetMapping("/{id}")
    public SpeakingPromptResponse get(@PathVariable Long id) {
        return SpeakingPromptResponse.from(findOrThrow(id));
    }

    @PostMapping
    public ResponseEntity<SpeakingPromptResponse> create(@Valid @RequestBody SpeakingPromptRequest request) {
        SpeakingPrompt prompt = new SpeakingPrompt();
        applyRequest(prompt, request);
        return ResponseEntity.ok(SpeakingPromptResponse.from(promptRepository.save(prompt)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpeakingPromptResponse> update(
        @PathVariable Long id, @Valid @RequestBody SpeakingPromptRequest request
    ) {
        SpeakingPrompt prompt = findOrThrow(id);
        applyRequest(prompt, request);
        return ResponseEntity.ok(SpeakingPromptResponse.from(promptRepository.save(prompt)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promptRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(SpeakingPrompt prompt, SpeakingPromptRequest request) {
        prompt.setLevel(request.level());
        prompt.setPromptText(request.promptText());
        prompt.setDescription(request.description());
        prompt.setOrderIndex(request.orderIndex());
    }

    private SpeakingPrompt findOrThrow(Long id) {
        return promptRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề bài"));
    }
}
