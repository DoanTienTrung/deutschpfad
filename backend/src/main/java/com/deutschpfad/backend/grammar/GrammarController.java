package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.vocabulary.LearningStreakService;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grammar")
public class GrammarController {

    private final GrammarTopicRepository topicRepository;
    private final GrammarExerciseRepository exerciseRepository;
    private final GrammarReferenceTableRepository referenceTableRepository;
    private final UserGrammarProgressRepository progressRepository;
    private final GrammarExerciseAttemptRepository attemptRepository;
    private final GrammarGradingService gradingService;
    private final UserRepository userRepository;
    private final LearningStreakService learningStreakService;

    public GrammarController(
        GrammarTopicRepository topicRepository,
        GrammarExerciseRepository exerciseRepository,
        GrammarReferenceTableRepository referenceTableRepository,
        UserGrammarProgressRepository progressRepository,
        GrammarExerciseAttemptRepository attemptRepository,
        GrammarGradingService gradingService,
        UserRepository userRepository,
        LearningStreakService learningStreakService
    ) {
        this.topicRepository = topicRepository;
        this.exerciseRepository = exerciseRepository;
        this.referenceTableRepository = referenceTableRepository;
        this.progressRepository = progressRepository;
        this.attemptRepository = attemptRepository;
        this.gradingService = gradingService;
        this.userRepository = userRepository;
        this.learningStreakService = learningStreakService;
    }

    /**
     * Bảng tra cứu nhanh. Đặt TRƯỚC {@code @GetMapping("/{slug}")} cho dễ đọc — Spring vẫn ưu tiên
     * đoạn đường dẫn cố định hơn biến, nhưng vì thế "reference" là slug cấm, xem
     * {@code GrammarAdminController.RESERVED_SLUGS}.
     */
    @GetMapping("/reference")
    public List<GrammarReferenceTableResponse> referenceTables() {
        return referenceTableRepository.findAllByOrderByCategoryAscOrderIndexAsc().stream()
            .map(GrammarReferenceTableResponse::from)
            .toList();
    }

    @GetMapping
    public List<GrammarTopicSummaryResponse> list(
        @RequestParam(required = false) VocabularyItem.Level level, Authentication authentication
    ) {
        List<GrammarTopic> topics = level != null
            ? topicRepository.findByLevelOrderByOrderIndex(level)
            : topicRepository.findAllByOrderByLevelAscOrderIndexAsc();

        // Nạp tiến độ một lần rồi tra theo Map, thay vì query từng chủ điểm trong vòng lặp.
        Map<Long, UserGrammarProgress> progressByTopic = progressByTopic(currentUser(authentication));

        return topics.stream()
            .map(topic -> GrammarTopicSummaryResponse.from(
                topic,
                exerciseRepository.countByTopicIdAndReviewedTrue(topic.getId()),
                progressByTopic.get(topic.getId())
            ))
            .toList();
    }

    @GetMapping("/progress/summary")
    public GrammarProgressSummaryResponse progressSummary(Authentication authentication) {
        Map<Long, UserGrammarProgress> progressByTopic = progressByTopic(currentUser(authentication));

        Map<VocabularyItem.Level, int[]> counters = new LinkedHashMap<>();
        for (GrammarTopic topic : topicRepository.findAllByOrderByLevelAscOrderIndexAsc()) {
            // [tong, thanh thao, dang hoc]
            int[] counter = counters.computeIfAbsent(topic.getLevel(), k -> new int[3]);
            counter[0]++;
            UserGrammarProgress progress = progressByTopic.get(topic.getId());
            if (progress == null) continue;
            if (progress.getStatus() == UserGrammarProgress.Status.MASTERED) counter[1]++;
            else counter[2]++;
        }

        List<GrammarProgressSummaryResponse.LevelProgress> levels = counters.entrySet().stream()
            .map(entry -> new GrammarProgressSummaryResponse.LevelProgress(
                entry.getKey().name(),
                entry.getValue()[0],
                entry.getValue()[1],
                entry.getValue()[2],
                entry.getValue()[0] - entry.getValue()[1] - entry.getValue()[2]
            ))
            .toList();
        return new GrammarProgressSummaryResponse(levels);
    }

    /**
     * Chủ điểm cần ôn hôm nay + chủ điểm nên học tiếp.
     *
     * <p>Đặt ở "/review" nên "review" cũng là slug cấm — xem RESERVED_SLUGS bên admin.
     */
    @GetMapping("/review")
    public GrammarReviewResponse review(
        @RequestParam(required = false) VocabularyItem.Level level, Authentication authentication
    ) {
        User user = currentUser(authentication);
        Map<Long, UserGrammarProgress> progressByTopic = progressByTopic(user);

        List<GrammarTopic> topics = level != null
            ? topicRepository.findByLevelOrderByOrderIndex(level)
            : topicRepository.findAllByOrderByLevelAscOrderIndexAsc();

        List<GrammarTopicSummaryResponse> due = new ArrayList<>();
        GrammarTopicSummaryResponse next = null;

        for (GrammarTopic topic : topics) {
            int exerciseCount = exerciseRepository.countByTopicIdAndReviewedTrue(topic.getId());
            // Chủ điểm chưa có bài thì không gợi ý — mở ra chỉ thấy lý thuyết rồi bí.
            if (exerciseCount == 0) continue;

            UserGrammarProgress progress = progressByTopic.get(topic.getId());
            if (progress == null) {
                if (next == null) next = GrammarTopicSummaryResponse.from(topic, exerciseCount, null);
            } else if (progress.isDue()) {
                due.add(GrammarTopicSummaryResponse.from(topic, exerciseCount, progress));
            }
        }
        return new GrammarReviewResponse(due, next);
    }

    private Map<Long, UserGrammarProgress> progressByTopic(User user) {
        Map<Long, UserGrammarProgress> byTopic = new HashMap<>();
        progressRepository.findByUser(user).forEach(p -> byTopic.put(p.getTopic().getId(), p));
        return byTopic;
    }

    @GetMapping("/{slug}")
    public GrammarTopicDetailResponse get(@PathVariable String slug) {
        GrammarTopic topic = findOrThrow(slug);
        return GrammarTopicDetailResponse.from(
            topic, exerciseRepository.findByTopicIdAndReviewedTrueOrderByOrderIndex(topic.getId())
        );
    }

    @PostMapping("/{slug}/submit")
    public GrammarSubmitResponse submit(
        @PathVariable String slug, @Valid @RequestBody GrammarSubmitRequest request, Authentication authentication
    ) {
        GrammarTopic topic = findOrThrow(slug);
        List<GrammarExercise> exercises =
            exerciseRepository.findByTopicIdAndReviewedTrueOrderByOrderIndex(topic.getId());

        Map<Long, String> submitted = new HashMap<>();
        if (request.answers() != null) {
            request.answers().forEach(a -> submitted.put(a.exerciseId(), a.answer()));
        }

        User user = currentUser(authentication);

        int correctCount = 0;
        List<GrammarSubmitResponse.ExerciseResult> results = new ArrayList<>();
        List<GrammarExerciseAttempt> attempts = new ArrayList<>();
        for (GrammarExercise exercise : exercises) {
            String submittedAnswer = submitted.get(exercise.getId());
            boolean correct = gradingService.isCorrect(exercise, submittedAnswer);
            if (correct) correctCount++;

            GrammarExerciseAttempt attempt = new GrammarExerciseAttempt();
            attempt.setUser(user);
            attempt.setExercise(exercise);
            attempt.setCorrect(correct);
            attempt.setSubmittedAnswer(submittedAnswer);
            attempts.add(attempt);

            results.add(new GrammarSubmitResponse.ExerciseResult(
                exercise.getId(),
                correct,
                submittedAnswer,
                exercise.getCorrectAnswer(),
                exercise.getExplanationVi()
            ));
        }

        attemptRepository.saveAll(attempts);

        // Chỉ ghi nhận khi chủ điểm thật sự có bài — nộp một chủ điểm rỗng không phải là "đã luyện".
        if (!exercises.isEmpty()) {
            UserGrammarProgress progress = progressRepository.findByUserAndTopic(user, topic)
                .orElseGet(() -> {
                    UserGrammarProgress created = new UserGrammarProgress();
                    created.setUser(user);
                    created.setTopic(topic);
                    return created;
                });
            progress.recordAttempt(correctCount, exercises.size());
            progressRepository.save(progress);
        }

        // Nộp bài ngữ pháp cũng tính là đã học hôm nay, giống Đọc/Nghe (xem ReadingController).
        learningStreakService.recordActivity(user);

        return new GrammarSubmitResponse(correctCount, exercises.size(), results);
    }

    private GrammarTopic findOrThrow(String slug) {
        return topicRepository.findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chủ điểm ngữ pháp"));
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
