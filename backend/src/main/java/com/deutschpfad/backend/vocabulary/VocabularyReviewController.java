package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vocabulary")
public class VocabularyReviewController {

    private final VocabularyReviewService reviewService;
    private final UserRepository userRepository;

    public VocabularyReviewController(VocabularyReviewService reviewService, UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @GetMapping("/review")
    public List<VocabularyItemResponse> dueCards(Authentication authentication) {
        return reviewService.getDueCards(currentUser(authentication));
    }

    @PostMapping("/review/{vocabularyItemId}")
    public ReviewResultResponse submitReview(
        @PathVariable Long vocabularyItemId,
        @Valid @RequestBody ReviewSubmitRequest request,
        Authentication authentication
    ) {
        return reviewService.submitReview(currentUser(authentication), vocabularyItemId, request.result());
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
