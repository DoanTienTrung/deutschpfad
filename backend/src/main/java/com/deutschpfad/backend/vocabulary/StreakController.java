package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/streak")
public class StreakController {

    private final LearningStreakService learningStreakService;
    private final UserRepository userRepository;

    public StreakController(LearningStreakService learningStreakService, UserRepository userRepository) {
        this.learningStreakService = learningStreakService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public StreakResponse getStreak(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        return StreakResponse.from(learningStreakService.getStreak(user));
    }
}
