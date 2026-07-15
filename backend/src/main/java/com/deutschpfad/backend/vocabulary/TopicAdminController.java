package com.deutschpfad.backend.vocabulary;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/topics")
@PreAuthorize("hasRole('ADMIN')")
public class TopicAdminController {

    private final TopicRepository topicRepository;

    public TopicAdminController(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    @GetMapping
    public List<Topic> list() {
        return topicRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Topic> create(@Valid @RequestBody TopicRequest request) {
        Topic topic = new Topic();
        topic.setName(request.name());
        return ResponseEntity.ok(topicRepository.save(topic));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Topic> update(@PathVariable Long id, @Valid @RequestBody TopicRequest request) {
        Topic topic = topicRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy topic"));
        topic.setName(request.name());
        return ResponseEntity.ok(topicRepository.save(topic));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        topicRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
