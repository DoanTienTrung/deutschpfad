package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.listening.GroqAiService;
import com.deutschpfad.backend.vocabulary.LearningStreakService;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/** Luyện dịch phía người học: danh sách bài, nội dung bài, chấm từng câu. */
@Service
public class TranslationService {

    private static final Logger log = LoggerFactory.getLogger(TranslationService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final TranslationSetRepository setRepository;
    private final TranslationItemRepository itemRepository;
    private final TranslationAttemptRepository attemptRepository;
    private final TranslationJudgmentRepository judgmentRepository;
    private final GroqAiService aiService;
    private final LearningStreakService learningStreakService;
    private final int aiDailyLimit;

    public TranslationService(
        TranslationSetRepository setRepository,
        TranslationItemRepository itemRepository,
        TranslationAttemptRepository attemptRepository,
        TranslationJudgmentRepository judgmentRepository,
        GroqAiService aiService,
        LearningStreakService learningStreakService,
        @Value("${app.translation.ai-daily-limit:100}") int aiDailyLimit
    ) {
        this.setRepository = setRepository;
        this.itemRepository = itemRepository;
        this.attemptRepository = attemptRepository;
        this.judgmentRepository = judgmentRepository;
        this.aiService = aiService;
        this.learningStreakService = learningStreakService;
        this.aiDailyLimit = aiDailyLimit;
    }

    public record SetSummary(
        Long id, TranslationSet.Type type, VocabularyItem.Level level, String title, String subtitle,
        String grammarSlug, int itemCount, int passedCount
    ) {}

    public record ItemView(
        Long id, int orderIndex, String partLabel, String viText, String deReference, List<String> alternatives,
        List<String> keywords, TranslationAttempt.Verdict lastVerdict
    ) {}

    public record SetDetail(
        Long id, TranslationSet.Type type, VocabularyItem.Level level, String title, String subtitle,
        String grammarSlug, String structureNote, List<ItemView> items
    ) {}

    public record CheckRequest(String answer, TranslationAttempt.Mode mode) {}

    public record CheckResponse(
        TranslationAttempt.Verdict verdict, TranslationAttempt.JudgedBy judgedBy, String corrected,
        List<TranslationChecker.ErrorNote> errors, String note, String reference, List<String> alternatives
    ) {}

    public List<SetSummary> listSets(User user, TranslationSet.Type type, VocabularyItem.Level level) {
        Map<Long, Integer> counts = itemRepository.countMapBySet();
        Map<Long, Integer> passed = attemptRepository.passedCountMap(user.getId());
        return setRepository.findByTypeAndLevelAndStatusOrderByOrderIndexAscIdAsc(type, level, TranslationSet.Status.PUBLISHED)
            .stream()
            .filter(s -> counts.getOrDefault(s.getId(), 0) > 0)
            .map(s -> new SetSummary(s.getId(), s.getType(), s.getLevel(), s.getTitle(), subtitle(s), grammarSlug(s),
                counts.getOrDefault(s.getId(), 0), passed.getOrDefault(s.getId(), 0)))
            .toList();
    }

    public SetDetail getSet(User user, Long id) {
        TranslationSet set = findVisibleSet(user, id);
        Map<Long, TranslationAttempt.Verdict> latest = attemptRepository.latestVerdictMap(user.getId(), id);
        List<ItemView> items = itemRepository.findBySetIdOrderByOrderIndexAscIdAsc(id).stream()
            .map(i -> new ItemView(i.getId(), i.getOrderIndex(), i.getPartLabel(), i.getViText(), i.getDeReference(),
                alternatives(i), keywords(i), latest.get(i.getId())))
            .toList();
        return new SetDetail(set.getId(), set.getType(), set.getLevel(), set.getTitle(), subtitle(set), grammarSlug(set),
            set.getStructureNote(), items);
    }

    /** Bài luyện dịch đã đăng của một chủ điểm ngữ pháp (cho nút "Luyện dịch chủ điểm này"), hoặc null. */
    public Long publishedSetIdForGrammar(String slug) {
        return setRepository.findFirstByGrammarTopic_SlugAndStatus(slug, TranslationSet.Status.PUBLISHED)
            .map(TranslationSet::getId)
            .orElse(null);
    }

    public CheckResponse check(User user, Long itemId, CheckRequest request) {
        TranslationItem item = itemRepository.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu"));
        findVisibleSet(user, item.getSet().getId());
        List<String> accepted = item.allAcceptedAnswers();
        List<String> alternatives = alternatives(item);
        TranslationAttempt.Mode mode = request.mode() == null ? TranslationAttempt.Mode.TYPING : request.mode();

        if (mode == TranslationAttempt.Mode.REVEAL) {
            save(user, item, null, mode, TranslationAttempt.Verdict.REVEALED, TranslationAttempt.JudgedBy.NONE, null);
            return new CheckResponse(TranslationAttempt.Verdict.REVEALED, TranslationAttempt.JudgedBy.NONE, null,
                List.of(), null, item.getDeReference(), alternatives);
        }
        String answer = request.answer() == null ? "" : request.answer().strip();
        if (answer.isEmpty()) throw new IllegalArgumentException("Chưa có bản dịch");

        TranslationChecker.Result local = TranslationChecker.check(answer, accepted);
        if (local != null) {
            return respond(user, item, answer, mode, local.verdict(), TranslationAttempt.JudgedBy.LOCAL, local.feedback(), alternatives);
        }

        String key = TranslationChecker.normalize(answer);
        var cached = judgmentRepository.findByItemIdAndAnswerKey(item.getId(), key);
        if (cached.isPresent()) {
            return respond(user, item, answer, mode, cached.get().getVerdict(), TranslationAttempt.JudgedBy.CACHE,
                readFeedback(cached.get().getFeedback()), alternatives);
        }

        long usedToday = attemptRepository.countByUserIdAndJudgedByAndCreatedAtAfter(
            user.getId(), TranslationAttempt.JudgedBy.AI, LocalDate.now().atStartOfDay());
        if (usedToday >= aiDailyLimit) {
            return respond(user, item, answer, mode, TranslationAttempt.Verdict.UNGRADED, TranslationAttempt.JudgedBy.NONE,
                new TranslationChecker.Feedback(null, List.of(), "Hôm nay bạn đã dùng hết " + aiDailyLimit
                    + " lượt chấm bằng AI. Tự so bản dịch với câu mẫu bên dưới nhé, mai lại có lượt mới."), alternatives);
        }

        String focus = item.getSet().getGrammarTopic() != null ? item.getSet().getGrammarTopic().getTitleDe() : null;
        String raw = aiService.completeValidated(
            TranslationAiPrompts.judge(item.getViText(), item.getDeReference(), focus, answer),
            text -> TranslationAiPrompts.parseJudgment(text) != null);
        TranslationAiPrompts.Judgment judgment = TranslationAiPrompts.parseJudgment(raw);
        if (judgment == null) {
            return respond(user, item, answer, mode, TranslationAttempt.Verdict.UNGRADED, TranslationAttempt.JudgedBy.NONE,
                new TranslationChecker.Feedback(null, List.of(),
                    "Chưa chấm được bằng AI lúc này. Tự so với câu mẫu bên dưới, hoặc thử lại sau ít phút."), alternatives);
        }
        cache(item, key, judgment);
        return respond(user, item, answer, mode, judgment.verdict(), TranslationAttempt.JudgedBy.AI, judgment.feedback(), alternatives);
    }

    // ------------------------------------------------------------------------------------------

    private TranslationSet findVisibleSet(User user, Long id) {
        TranslationSet set = setRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài"));
        // Admin xem trước được bài nháp; người học chỉ thấy bài đã đăng.
        if (set.getStatus() != TranslationSet.Status.PUBLISHED && user.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("Không tìm thấy bài");
        }
        return set;
    }

    private CheckResponse respond(
        User user, TranslationItem item, String answer, TranslationAttempt.Mode mode, TranslationAttempt.Verdict verdict,
        TranslationAttempt.JudgedBy judgedBy, TranslationChecker.Feedback feedback, List<String> alternatives
    ) {
        save(user, item, answer, mode, verdict, judgedBy, feedback);
        return new CheckResponse(verdict, judgedBy, feedback == null ? null : feedback.corrected(),
            feedback == null ? List.of() : feedback.errors(), feedback == null ? null : feedback.note(),
            item.getDeReference(), alternatives);
    }

    private void save(
        User user, TranslationItem item, String answer, TranslationAttempt.Mode mode, TranslationAttempt.Verdict verdict,
        TranslationAttempt.JudgedBy judgedBy, TranslationChecker.Feedback feedback
    ) {
        TranslationAttempt attempt = new TranslationAttempt();
        attempt.setUserId(user.getId());
        attempt.setItemId(item.getId());
        attempt.setAnswer(answer);
        attempt.setMode(mode);
        attempt.setVerdict(verdict);
        attempt.setJudgedBy(judgedBy);
        attempt.setFeedback(writeFeedback(feedback));
        attemptRepository.save(attempt);
        learningStreakService.recordActivity(user);
    }

    private void cache(TranslationItem item, String key, TranslationAiPrompts.Judgment judgment) {
        TranslationJudgment entity = new TranslationJudgment();
        entity.setItemId(item.getId());
        entity.setAnswerKey(key);
        entity.setVerdict(judgment.verdict());
        entity.setFeedback(writeFeedback(judgment.feedback()));
        try {
            judgmentRepository.save(entity);
        } catch (DataIntegrityViolationException e) {
            // Hai người nộp cùng một câu trả lời cùng lúc: bản kia đã vào cache trước, bỏ qua.
        }
    }

    private static String writeFeedback(TranslationChecker.Feedback feedback) {
        if (feedback == null) return null;
        try {
            return MAPPER.writeValueAsString(feedback);
        } catch (Exception e) {
            return null;
        }
    }

    private static TranslationChecker.Feedback readFeedback(String json) {
        if (json == null) return null;
        try {
            return MAPPER.readValue(json, new TypeReference<TranslationChecker.Feedback>() {});
        } catch (Exception e) {
            log.warn("Unreadable cached translation feedback", e);
            return null;
        }
    }

    private static List<String> alternatives(TranslationItem item) {
        List<String> all = item.allAcceptedAnswers();
        return all.subList(1, all.size());
    }

    private static List<String> keywords(TranslationItem item) {
        if (item.getHintKeywords() == null || item.getHintKeywords().isBlank()) return List.of();
        return Arrays.stream(item.getHintKeywords().split(",")).map(String::strip).filter(s -> !s.isEmpty()).toList();
    }

    private static String subtitle(TranslationSet set) {
        return set.getGrammarTopic() != null ? set.getGrammarTopic().getTitleDe() : set.getTheme();
    }

    private static String grammarSlug(TranslationSet set) {
        return set.getGrammarTopic() != null ? set.getGrammarTopic().getSlug() : null;
    }
}
