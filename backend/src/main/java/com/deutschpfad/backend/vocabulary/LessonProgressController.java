package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lessons/{lessonId}/progress")
public class LessonProgressController {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final LearningStreakService learningStreakService;

    public LessonProgressController(
        LessonProgressRepository lessonProgressRepository,
        LessonRepository lessonRepository,
        UserRepository userRepository,
        LearningStreakService learningStreakService
    ) {
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
        this.learningStreakService = learningStreakService;
    }

    public record MarkCompleteRequest(@NotNull PracticeMode mode) {}

    @GetMapping
    public Set<PracticeMode> completedModes(@PathVariable Long lessonId, Authentication authentication) {
        User user = currentUser(authentication);
        return lessonProgressRepository.findByUserAndLessonId(user, lessonId).stream()
            .map(LessonProgress::getMode)
            .collect(Collectors.toSet());
    }

    @PostMapping
    public Set<PracticeMode> markComplete(
        @PathVariable Long lessonId,
        @Valid @RequestBody MarkCompleteRequest request,
        Authentication authentication
    ) {
        User user = currentUser(authentication);
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài học"));

        LessonProgress progress = lessonProgressRepository
            .findByUserAndLessonIdAndMode(user, lessonId, request.mode())
            .orElseGet(() -> {
                LessonProgress created = new LessonProgress();
                created.setUser(user);
                created.setLesson(lesson);
                created.setMode(request.mode());
                return created;
            });
        lessonProgressRepository.save(progress);
        learningStreakService.recordActivity(user);

        return completedModes(lessonId, authentication);
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
