package com.deutschpfad.backend.reading;

import com.deutschpfad.backend.listening.GroqAiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reading-passages")
@PreAuthorize("hasRole('ADMIN')")
public class ReadingPassageAdminController {

    private final ReadingPassageRepository passageRepository;
    private final ReadingQuestionRepository questionRepository;
    private final ReadingMatchingOptionRepository matchingOptionRepository;
    private final ReadingWordTranslationRepository wordTranslationRepository;
    private final GroqAiService aiService;
    private final UnsplashService unsplashService;

    public ReadingPassageAdminController(
        ReadingPassageRepository passageRepository,
        ReadingQuestionRepository questionRepository,
        ReadingMatchingOptionRepository matchingOptionRepository,
        ReadingWordTranslationRepository wordTranslationRepository,
        GroqAiService aiService,
        UnsplashService unsplashService
    ) {
        this.passageRepository = passageRepository;
        this.questionRepository = questionRepository;
        this.matchingOptionRepository = matchingOptionRepository;
        this.wordTranslationRepository = wordTranslationRepository;
        this.aiService = aiService;
        this.unsplashService = unsplashService;
    }

    @GetMapping
    public List<ReadingPassageAdminResponse> list() {
        return passageRepository.findAll().stream()
            .map(passage -> ReadingPassageAdminResponse.from(
                passage,
                questionRepository.findByPassageIdOrderByOrderIndex(passage.getId()),
                matchingOptionRepository.findByPassageIdOrderByOrderIndex(passage.getId())
            ))
            .toList();
    }

    @GetMapping("/{id}")
    public ReadingPassageAdminResponse get(@PathVariable Long id) {
        ReadingPassage passage = findOrThrow(id);
        return ReadingPassageAdminResponse.from(
            passage,
            questionRepository.findByPassageIdOrderByOrderIndex(id),
            matchingOptionRepository.findByPassageIdOrderByOrderIndex(id)
        );
    }

    @PostMapping("/generate-draft")
    public ResponseEntity<GenerateDraftResponse> generateDraft(@Valid @RequestBody GenerateDraftRequest request) {
        String content = aiService.generateReadingPassage(request.topic(), request.level());
        if (content == null) {
            return ResponseEntity.unprocessableEntity().build();
        }
        return ResponseEntity.ok(new GenerateDraftResponse(content));
    }

    public record GenerateDraftRequest(
        @jakarta.validation.constraints.NotBlank String topic,
        @jakarta.validation.constraints.NotBlank String level
    ) {}

    public record GenerateDraftResponse(String content) {}

    @PostMapping
    public ResponseEntity<ReadingPassageAdminResponse> create(@Valid @RequestBody ReadingPassageRequest request) {
        ReadingPassage passage = new ReadingPassage();
        applyRequest(passage, request);
        fetchCoverImage(passage);
        passage = passageRepository.save(passage);
        return ResponseEntity.ok(applyQuestionsAndOptions(passage, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReadingPassageAdminResponse> update(
        @PathVariable Long id, @Valid @RequestBody ReadingPassageRequest request
    ) {
        ReadingPassage passage = findOrThrow(id);
        boolean contentChanged = !passage.getContent().equals(request.content());
        boolean topicChanged = !java.util.Objects.equals(passage.getTopic(), request.topic());
        applyRequest(passage, request);
        if (contentChanged) {
            passage.setContentTranslation(null);
            wordTranslationRepository.deleteByPassageId(passage.getId());
        }
        if (topicChanged || passage.getImageUrl() == null) fetchCoverImage(passage);
        passage = passageRepository.save(passage);
        return ResponseEntity.ok(applyQuestionsAndOptions(passage, request));
    }

    // Looks up a cover photo once, keyed by topic (falling back to title). Never overwrites an
    // existing image unless the topic changed, so a manually-good match isn't churned on every save.
    private void fetchCoverImage(ReadingPassage passage) {
        String query = passage.getTopic() != null && !passage.getTopic().isBlank()
            ? passage.getTopic() : passage.getTitle();
        UnsplashService.CoverImage image = unsplashService.findCoverImage(query);
        if (image != null) {
            passage.setImageUrl(image.imageUrl());
            passage.setImageAttributionName(image.attributionName());
            passage.setImageAttributionUrl(image.attributionUrl());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        questionRepository.deleteByPassageId(id);
        matchingOptionRepository.deleteByPassageId(id);
        passageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Questions and matching options are always fully replaced on save -- authoring happens as
    // one form submission (passage + all its questions/options together), not incremental edits.
    private ReadingPassageAdminResponse applyQuestionsAndOptions(ReadingPassage passage, ReadingPassageRequest request) {
        questionRepository.deleteByPassageId(passage.getId());
        List<ReadingQuestion> savedQuestions = new java.util.ArrayList<>();
        List<ReadingQuestionInput> questionInputs = request.questions();
        // ARTICLE passages (Sách, Báo) have no official answer key to author questions against, so
        // if the admin didn't supply any, let AI draft them instead of saving with none. EXAM
        // passages always use exactly what the admin (hand-verified against the real exam) supplied.
        if ((questionInputs == null || questionInputs.isEmpty()) && request.category() == ReadingPassage.Category.ARTICLE) {
            questionInputs = aiService.generateReadingQuestions(passage.getContent());
        }
        if (questionInputs != null) {
            for (int i = 0; i < questionInputs.size(); i++) {
                ReadingQuestionInput input = questionInputs.get(i);
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
                savedQuestions.add(questionRepository.save(question));
            }
        }

        matchingOptionRepository.deleteByPassageId(passage.getId());
        List<ReadingMatchingOption> savedOptions = new java.util.ArrayList<>();
        List<ReadingMatchingOptionInput> optionInputs = request.matchingOptions();
        if (optionInputs != null) {
            for (int i = 0; i < optionInputs.size(); i++) {
                ReadingMatchingOptionInput input = optionInputs.get(i);
                ReadingMatchingOption option = new ReadingMatchingOption();
                option.setPassage(passage);
                option.setOrderIndex(i);
                option.setLetter(input.letter());
                option.setText(input.text());
                savedOptions.add(matchingOptionRepository.save(option));
            }
        }

        return ReadingPassageAdminResponse.from(passage, savedQuestions, savedOptions);
    }

    private void applyRequest(ReadingPassage passage, ReadingPassageRequest request) {
        passage.setTitle(request.title());
        passage.setLevelMin(request.levelMin());
        passage.setLevelMax(request.levelMax());
        passage.setTopic(request.topic() != null && !request.topic().isBlank() ? request.topic().trim() : null);
        passage.setSourceLabel(
            request.sourceLabel() != null && !request.sourceLabel().isBlank() ? request.sourceLabel().trim() : null
        );
        passage.setSourceUrl(
            request.sourceUrl() != null && !request.sourceUrl().isBlank() ? request.sourceUrl().trim() : null
        );
        passage.setOrderIndex(request.orderIndex());
        passage.setContent(request.content());
        passage.setCategory(request.category());
    }

    private ReadingPassage findOrThrow(Long id) {
        return passageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài đọc"));
    }
}
