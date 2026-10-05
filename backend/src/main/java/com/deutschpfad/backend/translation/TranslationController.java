package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/translation")
public class TranslationController {

    private final TranslationService translationService;
    private final UserRepository userRepository;

    public TranslationController(TranslationService translationService, UserRepository userRepository) {
        this.translationService = translationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/sets")
    public List<TranslationService.SetSummary> list(
        @RequestParam TranslationSet.Type type, @RequestParam VocabularyItem.Level level, Authentication authentication
    ) {
        return translationService.listSets(currentUser(authentication), type, level);
    }

    @GetMapping("/sets/{id}")
    public TranslationService.SetDetail get(@PathVariable Long id, Authentication authentication) {
        return translationService.getSet(currentUser(authentication), id);
    }

    /** Bài luyện dịch của một chủ điểm ngữ pháp, cho nút "Luyện dịch chủ điểm này"; 404 nếu chưa có. */
    @GetMapping("/sets/by-grammar/{slug}")
    public ResponseEntity<Map<String, Long>> byGrammar(@PathVariable String slug) {
        Long id = translationService.publishedSetIdForGrammar(slug);
        return id == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(Map.of("id", id));
    }

    @PostMapping("/items/{id}/check")
    public TranslationService.CheckResponse check(
        @PathVariable Long id, @RequestBody TranslationService.CheckRequest request, Authentication authentication
    ) {
        return translationService.check(currentUser(authentication), id, request);
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
