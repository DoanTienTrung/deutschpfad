package com.deutschpfad.backend.grammar;

import com.deutschpfad.backend.listening.GroqAiService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CRUD chủ điểm ngữ pháp + bài tập.
 *
 * <p>Khác {@code ReadingPassageAdminController} ở một điểm có chủ ý: bài tập được quản lý
 * <b>riêng lẻ</b> (thêm/sửa/xoá/duyệt từng bài) thay vì thay thế toàn bộ mỗi lần lưu chủ điểm.
 * Lý do: Đợt 2 sẽ sinh bài tập hàng loạt (deterministic + AI) rồi admin duyệt dần từng bài — nếu
 * lưu chủ điểm mà xoá sạch bài tập như bên Đọc thì mỗi lần sửa lý thuyết sẽ mất hết bài đã sinh.
 */
@RestController
@RequestMapping("/api/admin/grammar")
@PreAuthorize("hasRole('ADMIN')")
public class GrammarAdminController {

    /**
     * Slug trùng với một đoạn đường dẫn cố định dưới /api/grammar sẽ khiến chủ điểm đó không bao
     * giờ mở được (route cố định luôn thắng biến {slug}), nên chặn ngay từ lúc tạo.
     */
    private static final List<String> RESERVED_SLUGS = List.of("reference", "progress", "review");

    private final GrammarTopicRepository topicRepository;
    private final GrammarExerciseRepository exerciseRepository;
    private final GrammarReferenceTableRepository referenceTableRepository;
    private final GrammarExerciseGenerator exerciseGenerator;
    private final GroqAiService aiService;

    public GrammarAdminController(
        GrammarTopicRepository topicRepository,
        GrammarExerciseRepository exerciseRepository,
        GrammarReferenceTableRepository referenceTableRepository,
        GrammarExerciseGenerator exerciseGenerator,
        GroqAiService aiService
    ) {
        this.topicRepository = topicRepository;
        this.exerciseRepository = exerciseRepository;
        this.referenceTableRepository = referenceTableRepository;
        this.exerciseGenerator = exerciseGenerator;
        this.aiService = aiService;
    }

    // ---- Chủ điểm ----

    @GetMapping("/topics")
    public List<GrammarTopicAdminResponse> listTopics() {
        return topicRepository.findAllByOrderByLevelAscOrderIndexAsc().stream()
            .map(topic -> GrammarTopicAdminResponse.from(
                topic, exerciseRepository.findByTopicIdOrderByOrderIndex(topic.getId())
            ))
            .toList();
    }

    @GetMapping("/topics/{id}")
    public GrammarTopicAdminResponse getTopic(@PathVariable Long id) {
        GrammarTopic topic = findTopicOrThrow(id);
        return GrammarTopicAdminResponse.from(topic, exerciseRepository.findByTopicIdOrderByOrderIndex(id));
    }

    @PostMapping("/topics")
    public ResponseEntity<GrammarTopicAdminResponse> createTopic(@Valid @RequestBody GrammarTopicRequest request) {
        if (RESERVED_SLUGS.contains(request.slug().trim().toLowerCase())) {
            throw new IllegalArgumentException(
                "Slug \"" + request.slug().trim() + "\" bị trùng với đường dẫn hệ thống, chọn slug khác"
            );
        }
        if (topicRepository.existsBySlug(request.slug().trim())) {
            throw new IllegalArgumentException("Slug \"" + request.slug().trim() + "\" đã tồn tại");
        }
        GrammarTopic topic = new GrammarTopic();
        applyRequest(topic, request);
        topic = topicRepository.save(topic);
        return ResponseEntity.ok(GrammarTopicAdminResponse.from(topic, List.of()));
    }

    @PutMapping("/topics/{id}")
    public ResponseEntity<GrammarTopicAdminResponse> updateTopic(
        @PathVariable Long id, @Valid @RequestBody GrammarTopicRequest request
    ) {
        GrammarTopic topic = findTopicOrThrow(id);
        String newSlug = request.slug().trim();
        if (!topic.getSlug().equals(newSlug) && topicRepository.existsBySlug(newSlug)) {
            throw new IllegalArgumentException("Slug \"" + newSlug + "\" đã tồn tại");
        }
        applyRequest(topic, request);
        topic = topicRepository.save(topic);
        return ResponseEntity.ok(
            GrammarTopicAdminResponse.from(topic, exerciseRepository.findByTopicIdOrderByOrderIndex(id))
        );
    }

    @DeleteMapping("/topics/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        exerciseRepository.deleteByTopicId(id);
        topicRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Bài tập ----

    @PostMapping("/topics/{topicId}/exercises")
    public ResponseEntity<GrammarExerciseAdminResponse> createExercise(
        @PathVariable Long topicId, @Valid @RequestBody GrammarExerciseRequest request
    ) {
        GrammarTopic topic = findTopicOrThrow(topicId);
        GrammarExercise exercise = new GrammarExercise();
        exercise.setTopic(topic);
        // Bài admin gõ tay coi như đã duyệt sẵn -- chỉ bài AI sinh mới cần qua bước duyệt.
        exercise.setGeneratedBy(GrammarExercise.GeneratedBy.MANUAL);
        exercise.setReviewed(true);
        applyRequest(exercise, request, nextOrderIndex(topicId));
        return ResponseEntity.ok(GrammarExerciseAdminResponse.from(exerciseRepository.save(exercise)));
    }

    @PutMapping("/exercises/{id}")
    public ResponseEntity<GrammarExerciseAdminResponse> updateExercise(
        @PathVariable Long id, @Valid @RequestBody GrammarExerciseRequest request
    ) {
        GrammarExercise exercise = findExerciseOrThrow(id);
        applyRequest(exercise, request, exercise.getOrderIndex());
        return ResponseEntity.ok(GrammarExerciseAdminResponse.from(exerciseRepository.save(exercise)));
    }

    /** Duyệt 1 bài (thường là bài AI sinh) để nó bắt đầu hiện ra cho người học. */
    @PostMapping("/exercises/{id}/review")
    public ResponseEntity<GrammarExerciseAdminResponse> reviewExercise(@PathVariable Long id) {
        GrammarExercise exercise = findExerciseOrThrow(id);
        exercise.setReviewed(true);
        return ResponseEntity.ok(GrammarExerciseAdminResponse.from(exerciseRepository.save(exercise)));
    }

    @DeleteMapping("/exercises/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        exerciseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Bảng tra cứu (Đợt 3) ----

    @GetMapping("/reference-tables")
    public List<GrammarReferenceTableResponse> listReferenceTables() {
        return referenceTableRepository.findAllByOrderByCategoryAscOrderIndexAsc().stream()
            .map(GrammarReferenceTableResponse::from)
            .toList();
    }

    @PostMapping("/reference-tables")
    public ResponseEntity<GrammarReferenceTableResponse> createReferenceTable(
        @Valid @RequestBody GrammarReferenceTableRequest request
    ) {
        if (referenceTableRepository.existsBySlug(request.slug().trim())) {
            throw new IllegalArgumentException("Slug \"" + request.slug().trim() + "\" đã tồn tại");
        }
        GrammarReferenceTable table = new GrammarReferenceTable();
        applyRequest(table, request);
        return ResponseEntity.ok(GrammarReferenceTableResponse.from(referenceTableRepository.save(table)));
    }

    @PutMapping("/reference-tables/{id}")
    public ResponseEntity<GrammarReferenceTableResponse> updateReferenceTable(
        @PathVariable Long id, @Valid @RequestBody GrammarReferenceTableRequest request
    ) {
        GrammarReferenceTable table = referenceTableRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bảng tra cứu"));
        String newSlug = request.slug().trim();
        if (!table.getSlug().equals(newSlug) && referenceTableRepository.existsBySlug(newSlug)) {
            throw new IllegalArgumentException("Slug \"" + newSlug + "\" đã tồn tại");
        }
        applyRequest(table, request);
        return ResponseEntity.ok(GrammarReferenceTableResponse.from(referenceTableRepository.save(table)));
    }

    @DeleteMapping("/reference-tables/{id}")
    public ResponseEntity<Void> deleteReferenceTable(@PathVariable Long id) {
        referenceTableRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(GrammarReferenceTable table, GrammarReferenceTableRequest request) {
        table.setSlug(request.slug().trim());
        table.setTitleVi(request.titleVi().trim());
        table.setCategory(request.category().trim());
        table.setLevel(request.level());
        table.setOrderIndex(request.orderIndex());
        table.setContentMd(request.contentMd());
        table.setUpdatedAt(LocalDateTime.now());
    }

    // ---- Sinh nội dung (Đợt 2) ----

    /**
     * Sinh bài tập deterministic từ dữ liệu có sẵn. Đáp án chắc chắn đúng nên lưu thẳng với
     * {@code reviewed = true} — không qua hàng chờ duyệt như bài AI.
     */
    @PostMapping("/topics/{topicId}/generate/data")
    public ResponseEntity<GenerateResult> generateFromData(
        @PathVariable Long topicId, @Valid @RequestBody GenerateDataRequest request
    ) {
        GrammarTopic topic = findTopicOrThrow(topicId);
        List<GrammarExercise> generated = exerciseGenerator.generate(topic, new GrammarExerciseGenerator.Options(
            request.kind(), clampCount(request.count()), request.kasus(), request.articleKind()
        ));
        return ResponseEntity.ok(saveGenerated(topicId, generated));
    }

    /** Sinh bài tập bằng AI (3 tầng Groq → Gemini → OpenRouter). Luôn lưu với reviewed = false. */
    @PostMapping("/topics/{topicId}/generate/ai")
    public ResponseEntity<GenerateResult> generateFromAi(
        @PathVariable Long topicId, @RequestBody GenerateAiRequest request
    ) {
        GrammarTopic topic = findTopicOrThrow(topicId);
        List<GrammarExerciseDraft> drafts = aiService.generateGrammarExercises(
            topic.getTitleDe(), topic.getLevel().name(), topic.getTheoryMd(), clampCount(request.count())
        );

        List<GrammarExercise> generated = new ArrayList<>();
        for (GrammarExerciseDraft draft : drafts) {
            GrammarExercise exercise = new GrammarExercise();
            exercise.setTopic(topic);
            exercise.setExerciseType(draft.exerciseType());
            exercise.setPromptDe(draft.promptDe());
            exercise.setOptionA(draft.optionA());
            exercise.setOptionB(draft.optionB());
            exercise.setOptionC(draft.optionC());
            exercise.setCorrectAnswer(draft.correctAnswer());
            exercise.setExplanationVi(draft.explanationVi());
            exercise.setGeneratedBy(GrammarExercise.GeneratedBy.AI);
            exercise.setReviewed(false);
            generated.add(exercise);
        }
        return ResponseEntity.ok(saveGenerated(topicId, generated));
    }

    /** AI soạn nháp lý thuyết tiếng Việt; chỉ trả về markdown, admin tự sửa rồi mới bấm lưu. */
    @PostMapping("/topics/generate-theory")
    public ResponseEntity<GenerateTheoryResponse> generateTheory(
        @Valid @RequestBody GenerateTheoryRequest request
    ) {
        String theory = aiService.generateGrammarTheory(request.titleDe(), request.titleVi(), request.level());
        if (theory == null || theory.isBlank()) {
            return ResponseEntity.unprocessableEntity().build();
        }
        return ResponseEntity.ok(new GenerateTheoryResponse(theory));
    }

    public record GenerateDataRequest(
        GrammarExerciseGenerator.Kind kind,
        Integer count,
        GermanDeclension.Kasus kasus,
        GermanDeclension.ArticleKind articleKind
    ) {}

    public record GenerateAiRequest(Integer count) {}

    public record GenerateTheoryRequest(
        @NotBlank String titleDe, String titleVi, @NotBlank String level
    ) {}

    public record GenerateTheoryResponse(String theoryMd) {}

    /** {@code created} là số bài thực sự lưu được — có thể ít hơn số yêu cầu, xem {@code note}. */
    public record GenerateResult(int created, int pendingReview, String note) {}

    private GenerateResult saveGenerated(Long topicId, List<GrammarExercise> generated) {
        int orderIndex = nextOrderIndex(topicId);
        int pendingReview = 0;
        for (GrammarExercise exercise : generated) {
            exercise.setOrderIndex(orderIndex++);
            if (!exercise.isReviewed()) pendingReview++;
            exerciseRepository.save(exercise);
        }
        String note = generated.isEmpty()
            // Nói thẳng lý do thay vì im lặng trả 0 — nguyên nhân hay gặp nhất là kho từ vựng
            // ở level đó trống, chứ không phải bộ sinh hỏng.
            ? "Không sinh được bài nào. Kiểm tra: kho từ vựng ở level này có dữ liệu chưa, "
                + "và (với dạng chia động từ) có động từ yếu nào không."
            : null;
        return new GenerateResult(generated.size(), pendingReview, note);
    }

    private static int clampCount(Integer count) {
        if (count == null) return 10;
        return Math.max(1, Math.min(50, count));
    }

    private int nextOrderIndex(Long topicId) {
        return exerciseRepository.findByTopicIdOrderByOrderIndex(topicId).stream()
            .mapToInt(GrammarExercise::getOrderIndex)
            .max()
            .orElse(-1) + 1;
    }

    private void applyRequest(GrammarTopic topic, GrammarTopicRequest request) {
        topic.setSlug(request.slug().trim());
        topic.setTitleDe(request.titleDe().trim());
        topic.setTitleVi(request.titleVi().trim());
        topic.setLevel(request.level());
        topic.setGroupLabel(blankToNull(request.groupLabel()));
        topic.setOrderIndex(request.orderIndex());
        topic.setSummaryVi(blankToNull(request.summaryVi()));
        topic.setTheoryMd(blankToNull(request.theoryMd()));
        topic.setUpdatedAt(LocalDateTime.now());
    }

    private void applyRequest(GrammarExercise exercise, GrammarExerciseRequest request, int fallbackOrderIndex) {
        exercise.setExerciseType(request.exerciseType());
        exercise.setPromptDe(request.promptDe().trim());
        exercise.setHintVi(blankToNull(request.hintVi()));
        exercise.setOptionA(blankToNull(request.optionA()));
        exercise.setOptionB(blankToNull(request.optionB()));
        exercise.setOptionC(blankToNull(request.optionC()));
        exercise.setOptionD(blankToNull(request.optionD()));
        exercise.setCorrectAnswer(request.correctAnswer().trim());
        exercise.setExplanationVi(blankToNull(request.explanationVi()));
        exercise.setOrderIndex(request.orderIndex() != null ? request.orderIndex() : fallbackOrderIndex);
    }

    private static String blankToNull(String value) {
        return value != null && !value.isBlank() ? value.trim() : null;
    }

    private GrammarTopic findTopicOrThrow(Long id) {
        return topicRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chủ điểm ngữ pháp"));
    }

    private GrammarExercise findExerciseOrThrow(Long id) {
        return exerciseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài tập"));
    }
}
