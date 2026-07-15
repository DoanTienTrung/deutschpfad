package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.vocabulary.LearningStreakService;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/listening")
public class ListeningController {

    private final ListeningExerciseRepository exerciseRepository;
    private final ListeningSentenceRepository sentenceRepository;
    private final DeepgramTranscriptionService transcriptionService;
    private final GroqAiService translationService;
    private final UserRepository userRepository;
    private final LearningStreakService learningStreakService;

    public ListeningController(
        ListeningExerciseRepository exerciseRepository,
        ListeningSentenceRepository sentenceRepository,
        DeepgramTranscriptionService transcriptionService,
        GroqAiService translationService,
        UserRepository userRepository,
        LearningStreakService learningStreakService
    ) {
        this.exerciseRepository = exerciseRepository;
        this.sentenceRepository = sentenceRepository;
        this.transcriptionService = transcriptionService;
        this.translationService = translationService;
        this.userRepository = userRepository;
        this.learningStreakService = learningStreakService;
    }

    // Any listening practice (Shadowing/Dictation/Cloze, admin-curated or personal video) counts
    // toward the daily streak — recordActivity is idempotent per day, so it's safe to call once
    // per practice session without tracking per-sentence completion state server-side.
    @PostMapping("/progress")
    public ResponseEntity<Void> recordProgress(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        learningStreakService.recordActivity(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<ListeningExerciseSummaryResponse> list(
        @RequestParam VocabularyItem.Level level, @RequestParam(required = false) String topic
    ) {
        boolean hasTopic = topic != null && !topic.isBlank();
        return exerciseRepository.findAllByOrderByOrderIndex().stream()
            // A topic filter browses across all levels (topic badge on each card still shows its
            // real level) — only apply the level-range filter when no topic is selected.
            .filter(exercise -> hasTopic || (level.ordinal() >= exercise.getLevelMin().ordinal()
                && level.ordinal() <= exercise.getLevelMax().ordinal()))
            .filter(exercise -> !hasTopic || topic.equals(exercise.getTopic()))
            .map(exercise -> ListeningExerciseSummaryResponse.from(
                exercise, sentenceRepository.findByExerciseIdOrderByOrderIndex(exercise.getId()).size()
            ))
            .toList();
    }

    @GetMapping("/topics")
    public List<String> topics() {
        return exerciseRepository.findAllByOrderByOrderIndex().stream()
            .map(ListeningExercise::getTopic)
            .filter(t -> t != null && !t.isBlank())
            .distinct()
            .sorted()
            .toList();
    }

    @GetMapping("/{id}")
    public ListeningExerciseDetailResponse get(@PathVariable Long id) {
        ListeningExercise exercise = exerciseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài nghe"));
        List<ListeningSentence> sentences = sentenceRepository.findByExerciseIdOrderByOrderIndex(id);
        return ListeningExerciseDetailResponse.from(exercise, sentences);
    }

    @PostMapping(value = "/sentences/{sentenceId}/shadowing-feedback", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ShadowingFeedbackResponse gradeShadowing(
        @PathVariable Long sentenceId, @RequestParam("audio") MultipartFile audio
    ) throws IOException {
        ListeningSentence sentence = sentenceRepository.findById(sentenceId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu"));

        String transcript = transcriptionService.transcribe(audio.getBytes(), audio.getContentType());
        if (transcript == null) return ShadowingFeedbackResponse.unavailable();

        return ShadowingFeedbackResponse.from(transcript, PronunciationScorer.score(sentence.getText(), transcript));
    }

    @GetMapping("/sentences/{sentenceId}/word-translation")
    public WordTranslationResponse translateWord(@PathVariable Long sentenceId, @RequestParam String word) {
        ListeningSentence sentence = sentenceRepository.findById(sentenceId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu"));

        String translation = translationService.translateWord(word, sentence.getText());
        return new WordTranslationResponse(word, translation, translation != null);
    }
}
