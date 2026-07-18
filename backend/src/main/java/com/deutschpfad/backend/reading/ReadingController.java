package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.listening.GroqAiService;
import com.deutschpfad.backend.listening.WordTranslationResponse;
import com.deutschpfad.backend.vocabulary.LearningStreakService;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reading")
public class ReadingController {

    private final ReadingPassageRepository passageRepository;
    private final ReadingQuestionRepository questionRepository;
    private final ReadingMatchingOptionRepository matchingOptionRepository;
    private final ReadingWordTranslationRepository wordTranslationRepository;
    private final GroqAiService aiService;
    private final UnsplashService unsplashService;
    private final UserRepository userRepository;
    private final LearningStreakService learningStreakService;

    public ReadingController(
        ReadingPassageRepository passageRepository,
        ReadingQuestionRepository questionRepository,
        ReadingMatchingOptionRepository matchingOptionRepository,
        ReadingWordTranslationRepository wordTranslationRepository,
        GroqAiService aiService,
        UnsplashService unsplashService,
        UserRepository userRepository,
        LearningStreakService learningStreakService
    ) {
        this.passageRepository = passageRepository;
        this.questionRepository = questionRepository;
        this.matchingOptionRepository = matchingOptionRepository;
        this.wordTranslationRepository = wordTranslationRepository;
        this.aiService = aiService;
        this.unsplashService = unsplashService;
        this.userRepository = userRepository;
        this.learningStreakService = learningStreakService;
    }

    @PostMapping("/progress")
    public ResponseEntity<Void> recordProgress(Authentication authentication) {
        learningStreakService.recordActivity(currentUser(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<ReadingPassageSummaryResponse> list(
        @RequestParam VocabularyItem.Level level, @RequestParam(required = false) String topic
    ) {
        boolean hasTopic = topic != null && !topic.isBlank();
        return passageRepository.findByOwnerIsNullOrderByOrderIndex().stream()
            .filter(passage -> hasTopic || (level.ordinal() >= passage.getLevelMin().ordinal()
                && level.ordinal() <= passage.getLevelMax().ordinal()))
            .filter(passage -> !hasTopic || topic.equals(passage.getTopic()))
            .map(passage -> ReadingPassageSummaryResponse.from(
                passage, questionRepository.findByPassageIdOrderByOrderIndex(passage.getId()).size()
            ))
            .toList();
    }

    @GetMapping("/topics")
    public List<String> topics() {
        return passageRepository.findByOwnerIsNullOrderByOrderIndex().stream()
            .map(ReadingPassage::getTopic)
            .filter(t -> t != null && !t.isBlank())
            .distinct()
            .sorted()
            .toList();
    }

    @GetMapping("/{id}")
    public ReadingPassageDetailResponse get(@PathVariable Long id, Authentication authentication) {
        ReadingPassage passage = findViewableOrThrow(id, authentication);
        if (passage.getContentTranslation() == null) {
            String translation = aiService.translatePassage(passage.getContent());
            if (translation != null) {
                passage.setContentTranslation(translation);
                passage = passageRepository.save(passage);
            }
        }
        List<ReadingQuestion> questions = questionRepository.findByPassageIdOrderByOrderIndex(id);
        List<ReadingMatchingOption> matchingOptions = matchingOptionRepository.findByPassageIdOrderByOrderIndex(id);
        return ReadingPassageDetailResponse.from(passage, questions, matchingOptions);
    }

    @PostMapping("/passages/{id}/submit")
    public ReadingSubmitResponse submit(
        @PathVariable Long id, @RequestBody ReadingSubmitRequest request, Authentication authentication
    ) {
        findViewableOrThrow(id, authentication);
        List<ReadingQuestion> questions = questionRepository.findByPassageIdOrderByOrderIndex(id);
        Map<Long, String> submitted = new HashMap<>();
        if (request.answers() != null) {
            request.answers().forEach(a -> submitted.put(a.questionId(), a.answer()));
        }

        int correctCount = 0;
        int totalCount = 0;
        List<ReadingSubmitResponse.QuestionResult> results = new java.util.ArrayList<>();
        for (ReadingQuestion question : questions) {
            String submittedAnswer = submitted.get(question.getId());

            // SHORT_ANSWER (free-text keywords/paraphrase) can't be reliably auto-graded -- shown
            // as a model answer for the learner to self-check instead, and excluded from the score.
            if (question.getQuestionType() == ReadingQuestion.QuestionType.SHORT_ANSWER) {
                results.add(new ReadingSubmitResponse.QuestionResult(
                    question.getId(), false, submittedAnswer, question.getCorrectAnswer(), question.getExplanation()
                ));
                continue;
            }

            totalCount++;
            boolean correct = submittedAnswer != null && isAccepted(submittedAnswer, question.getCorrectAnswer());
            if (correct) correctCount++;
            results.add(new ReadingSubmitResponse.QuestionResult(
                question.getId(), correct, submittedAnswer, question.getCorrectAnswer(), question.getExplanation()
            ));
        }
        return new ReadingSubmitResponse(correctCount, totalCount, results);
    }

    // FILL_BLANK questions may list multiple accepted answers separated by "/" (e.g. spelling or
    // grammatical variants); every other type has exactly one correct value.
    private boolean isAccepted(String submittedAnswer, String correctAnswer) {
        String trimmed = submittedAnswer.trim();
        for (String accepted : correctAnswer.split("/")) {
            if (accepted.trim().equalsIgnoreCase(trimmed)) return true;
        }
        return false;
    }

    @GetMapping("/passages/{id}/word-translation")
    public WordTranslationResponse translateWord(
        @PathVariable Long id, @RequestParam String word, Authentication authentication
    ) {
        ReadingPassage passage = findViewableOrThrow(id, authentication);
        String normalizedWord = word.toLowerCase();

        java.util.Optional<ReadingWordTranslation> cached =
            wordTranslationRepository.findByPassageIdAndWord(id, normalizedWord);
        if (cached.isPresent()) {
            return new WordTranslationResponse(word, cached.get().getTranslation(), true);
        }

        String translation = aiService.translateWord(word, passage.getContent());
        if (translation != null) {
            ReadingWordTranslation entry = new ReadingWordTranslation();
            entry.setPassage(passage);
            entry.setWord(normalizedWord);
            entry.setTranslation(translation);
            wordTranslationRepository.save(entry);
        }
        return new WordTranslationResponse(word, translation, translation != null);
    }

    // ---- "Bài đọc của tôi": private passages a user pastes and practices on their own ----

    @GetMapping("/mine")
    public List<ReadingPassageSummaryResponse> listMine(Authentication authentication) {
        User user = currentUser(authentication);
        return passageRepository.findByOwnerOrderByCreatedAtDesc(user).stream()
            .map(passage -> ReadingPassageSummaryResponse.from(
                passage, questionRepository.findByPassageIdOrderByOrderIndex(passage.getId()).size()
            ))
            .toList();
    }

    @PostMapping("/mine")
    public ResponseEntity<ReadingPassageDetailResponse> createMine(
        @Valid @RequestBody UserReadingPassageRequest request, Authentication authentication
    ) {
        ReadingPassage passage = new ReadingPassage();
        passage.setOwner(currentUser(authentication));
        passage.setCategory(ReadingPassage.Category.ARTICLE);
        passage.setOrderIndex(0);
        applyUserRequest(passage, request);
        fetchCoverImage(passage);
        passage = passageRepository.save(passage);

        // Always AI-generated for personal passages -- there's no manual question-authoring UI
        // for this flow, matching how "Video của tôi" keeps the add-content form minimal.
        List<ReadingQuestionInput> generated = aiService.generateReadingQuestions(passage.getContent());
        List<ReadingQuestion> saved = saveQuestions(passage, generated);
        return ResponseEntity.ok(ReadingPassageDetailResponse.from(passage, saved, List.of()));
    }

    @PutMapping("/mine/{id}")
    public ResponseEntity<ReadingPassageDetailResponse> updateMine(
        @PathVariable Long id, @Valid @RequestBody UserReadingPassageRequest request, Authentication authentication
    ) {
        ReadingPassage passage = findOwnedOrThrow(id, currentUser(authentication));
        boolean contentChanged = !passage.getContent().equals(request.content());
        boolean titleChanged = !passage.getTitle().equals(request.title());
        applyUserRequest(passage, request);
        if (contentChanged) {
            passage.setContentTranslation(null);
            wordTranslationRepository.deleteByPassageId(passage.getId());
        }
        if (titleChanged || passage.getImageUrl() == null) fetchCoverImage(passage);
        passage = passageRepository.save(passage);

        List<ReadingQuestion> saved;
        if (contentChanged) {
            List<ReadingQuestionInput> generated = aiService.generateReadingQuestions(passage.getContent());
            saved = saveQuestions(passage, generated);
        } else {
            saved = questionRepository.findByPassageIdOrderByOrderIndex(id);
        }
        return ResponseEntity.ok(ReadingPassageDetailResponse.from(passage, saved, List.of()));
    }

    @DeleteMapping("/mine/{id}")
    public ResponseEntity<Void> deleteMine(@PathVariable Long id, Authentication authentication) {
        ReadingPassage passage = findOwnedOrThrow(id, currentUser(authentication));
        questionRepository.deleteByPassageId(passage.getId());
        passageRepository.delete(passage);
        return ResponseEntity.noContent().build();
    }

    private List<ReadingQuestion> saveQuestions(ReadingPassage passage, List<ReadingQuestionInput> inputs) {
        questionRepository.deleteByPassageId(passage.getId());
        List<ReadingQuestion> saved = new java.util.ArrayList<>();
        for (int i = 0; i < inputs.size(); i++) {
            ReadingQuestionInput input = inputs.get(i);
            ReadingQuestion question = new ReadingQuestion();
            question.setPassage(passage);
            question.setOrderIndex(i);
            question.setQuestionText(input.questionText());
            question.setQuestionType(input.questionType());
            question.setOptionA(input.optionA());
            question.setOptionB(input.optionB());
            question.setOptionC(input.optionC());
            question.setOptionD(input.optionD());
            question.setCorrectAnswer(input.correctAnswer());
            question.setExplanation(input.explanation());
            saved.add(questionRepository.save(question));
        }
        return saved;
    }

    private void fetchCoverImage(ReadingPassage passage) {
        UnsplashService.CoverImage image = unsplashService.findCoverImage(passage.getTitle());
        if (image != null) {
            passage.setImageUrl(image.imageUrl());
            passage.setImageAttributionName(image.attributionName());
            passage.setImageAttributionUrl(image.attributionUrl());
        }
    }

    private void applyUserRequest(ReadingPassage passage, UserReadingPassageRequest request) {
        passage.setTitle(request.title());
        passage.setLevelMin(request.levelMin());
        passage.setLevelMax(request.levelMax());
        passage.setContent(request.content());
        passage.setSourceUrl(request.sourceUrl() != null && !request.sourceUrl().isBlank() ? request.sourceUrl().trim() : null);
    }

    private ReadingPassage findOwnedOrThrow(Long id, User user) {
        ReadingPassage passage = passageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài đọc"));
        if (passage.getOwner() == null || !passage.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập bài đọc này");
        }
        return passage;
    }

    // Shared passages (owner == null) are viewable by anyone; private passages only by their owner.
    private ReadingPassage findViewableOrThrow(Long id, Authentication authentication) {
        ReadingPassage passage = passageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài đọc"));
        if (passage.getOwner() != null && !passage.getOwner().getId().equals(currentUser(authentication).getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập bài đọc này");
        }
        return passage;
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
