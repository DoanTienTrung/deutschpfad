package com.deutschpfad.backend.translation;

import com.deutschpfad.backend.grammar.GrammarTopic;
import com.deutschpfad.backend.grammar.GrammarTopicRepository;
import com.deutschpfad.backend.listening.GroqAiService;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin: bài luyện dịch theo chủ điểm ngữ pháp (mỗi chủ điểm một bài) và bài theo chủ đề (collocation, đoạn văn,
 * essay; tạo tay hoặc AI soạn nháp), sửa từng câu rồi đăng.
 */
@Service
public class TranslationAdminService {

    private final TranslationSetRepository setRepository;
    private final TranslationItemRepository itemRepository;
    private final GrammarTopicRepository grammarTopicRepository;
    private final GroqAiService aiService;

    public TranslationAdminService(
        TranslationSetRepository setRepository,
        TranslationItemRepository itemRepository,
        GrammarTopicRepository grammarTopicRepository,
        GroqAiService aiService
    ) {
        this.setRepository = setRepository;
        this.itemRepository = itemRepository;
        this.grammarTopicRepository = grammarTopicRepository;
        this.aiService = aiService;
    }

    public record GrammarTopicRow(
        Long topicId, VocabularyItem.Level level, String slug, String titleVi, String titleDe,
        Long setId, TranslationSet.Status status, int itemCount
    ) {}

    public record ItemData(
        Long id, String partLabel, String viText, String deReference, String acceptedAnswers, String hintKeywords,
        String focus, String gap
    ) {}

    public record SetData(
        Long id, TranslationSet.Type type, VocabularyItem.Level level, String title, String theme, String grammarTitleDe,
        String structureNote, TranslationSet.Status status, List<ItemData> items
    ) {}

    /** {@code theme}, {@code level} null thì giữ nguyên (bài ngữ pháp không đổi cấp độ). */
    public record SetUpdate(
        String title, String theme, VocabularyItem.Level level, String structureNote, TranslationSet.Status status,
        List<ItemData> items
    ) {}

    public record SetRow(
        Long id, TranslationSet.Type type, VocabularyItem.Level level, String title, String theme,
        TranslationSet.Status status, int itemCount
    ) {}

    public record NewSet(TranslationSet.Type type, VocabularyItem.Level level, String title, String theme) {}

    public List<GrammarTopicRow> grammarTopics() {
        Map<Long, TranslationSet> setsByTopic = new HashMap<>();
        for (TranslationSet s : setRepository.findByTypeOrderByLevelAscOrderIndexAscIdAsc(TranslationSet.Type.GRAMMAR)) {
            if (s.getGrammarTopic() != null) setsByTopic.put(s.getGrammarTopic().getId(), s);
        }
        Map<Long, Integer> counts = itemRepository.countMapBySet();
        return grammarTopicRepository.findAll(Sort.by("level", "orderIndex")).stream()
            .map(t -> {
                TranslationSet s = setsByTopic.get(t.getId());
                return new GrammarTopicRow(t.getId(), t.getLevel(), t.getSlug(), t.getTitleVi(), t.getTitleDe(),
                    s == null ? null : s.getId(), s == null ? null : s.getStatus(),
                    s == null ? 0 : counts.getOrDefault(s.getId(), 0));
            })
            .toList();
    }

    public SetData get(Long id) {
        return toData(findSet(id));
    }

    /** Bài theo chủ đề của một dạng (collocation, đoạn văn, essay), cả nháp lẫn đã đăng. */
    public List<SetRow> themedSets(TranslationSet.Type type) {
        Map<Long, Integer> counts = itemRepository.countMapBySet();
        return setRepository.findByTypeOrderByLevelAscOrderIndexAscIdAsc(type).stream()
            .map(s -> new SetRow(s.getId(), s.getType(), s.getLevel(), s.getTitle(), s.getTheme(), s.getStatus(),
                counts.getOrDefault(s.getId(), 0)))
            .toList();
    }

    /** Tạo bài trống theo chủ đề (nháp) để admin tự nhập câu. */
    @Transactional
    public SetData create(NewSet request) {
        if (request.type() == null || request.type() == TranslationSet.Type.GRAMMAR) {
            throw new IllegalArgumentException("Bài ngữ pháp tạo theo chủ điểm, không tạo tay");
        }
        if (request.level() == null || request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Cần chọn cấp độ và đặt tên bài");
        }
        return toData(setRepository.save(newThemedSet(request.type(), request.level(), request.title().strip(),
            blankToNull(request.theme()))));
    }

    /**
     * AI soạn nháp một bài mới theo chủ đề. Bài luôn ở dạng nháp, admin sửa rồi mới đăng.
     * Không @Transactional: lần gọi AI mất tới vài chục giây, không giữ kết nối DB trong lúc chờ.
     */
    public SetData generateThemed(TranslationSet.Type type, VocabularyItem.Level level, String theme, int count) {
        if (type == TranslationSet.Type.GRAMMAR) throw new IllegalArgumentException("Bài ngữ pháp soạn theo chủ điểm");
        if (theme == null || theme.isBlank()) throw new IllegalArgumentException("Cần nhập chủ đề");
        String raw = aiService.completeValidated(
            TranslationAiPrompts.draftThemed(type, level.name(), theme.strip(), count),
            text -> !TranslationAiPrompts.parseDraft(text).items().isEmpty());
        TranslationAiPrompts.Draft draft = TranslationAiPrompts.parseDraft(raw);
        if (draft.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "AI chưa soạn được bài nào (Groq và Gemini đều lỗi hoặc hết lượt). Thử lại sau.");
        }
        TranslationSet set = newThemedSet(type, level, theme.strip(), theme.strip());
        set.setStructureNote(draft.structureNote());
        set = setRepository.save(set);
        saveDraftItems(set, draft.items(), 0);
        return toData(set);
    }

    private TranslationSet newThemedSet(TranslationSet.Type type, VocabularyItem.Level level, String title, String theme) {
        TranslationSet set = new TranslationSet();
        set.setType(type);
        set.setLevel(level);
        set.setTitle(title);
        set.setTheme(theme);
        set.setStatus(TranslationSet.Status.DRAFT);
        set.setOrderIndex(setRepository.findByTypeOrderByLevelAscOrderIndexAscIdAsc(type).size() + 1);
        return set;
    }

    private void saveDraftItems(TranslationSet set, List<TranslationAiPrompts.DraftItem> drafts, int startOrder) {
        int next = startOrder;
        for (TranslationAiPrompts.DraftItem d : drafts) {
            TranslationItem item = new TranslationItem();
            item.setSet(set);
            item.setOrderIndex(++next);
            item.setViText(d.viText());
            item.setDeReference(d.deReference());
            item.setAcceptedAnswers(d.alternatives().isEmpty() ? null : String.join("\n", d.alternatives()));
            item.setHintKeywords(d.keywords());
            item.setFocus(d.focus());
            item.setGap(d.gap());
            item.setPartLabel(d.partLabel());
            itemRepository.save(item);
        }
    }

    /**
     * AI soạn nháp {@code count} câu cho một chủ điểm và thêm vào bài của chủ điểm đó (tạo bài nháp nếu chưa có).
     * Câu mới luôn ở dạng nháp của bài; bài đã đăng thì câu mới hiện ngay, nên admin xem lại trước khi bấm.
     */
    // Không @Transactional: lần gọi AI mất tới vài chục giây, không giữ kết nối DB trong lúc chờ.
    public SetData generateForGrammarTopic(Long topicId, int count) {
        GrammarTopic topic = grammarTopicRepository.findById(topicId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chủ điểm"));
        String raw = aiService.completeValidated(
            TranslationAiPrompts.draft(topic.getTitleDe(), topic.getTitleVi(), topic.getLevel().name(), topic.getSummaryVi(), count),
            text -> !TranslationAiPrompts.parseDraft(text).items().isEmpty());
        TranslationAiPrompts.Draft draft = TranslationAiPrompts.parseDraft(raw);
        if (draft.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "AI chưa soạn được câu nào (Groq và Gemini đều lỗi hoặc hết lượt). Thử lại sau.");
        }

        TranslationSet set = setRepository.findByGrammarTopicId(topicId).orElseGet(() -> {
            TranslationSet created = new TranslationSet();
            created.setType(TranslationSet.Type.GRAMMAR);
            created.setLevel(topic.getLevel());
            created.setTitle(topic.getTitleVi());
            created.setGrammarTopic(topic);
            created.setOrderIndex(topic.getOrderIndex());
            created.setStatus(TranslationSet.Status.DRAFT);
            return created;
        });
        if ((set.getStructureNote() == null || set.getStructureNote().isBlank()) && draft.structureNote() != null) {
            set.setStructureNote(draft.structureNote());
        }
        set.setUpdatedAt(LocalDateTime.now());
        set = setRepository.save(set);

        saveDraftItems(set, draft.items(), itemRepository.findBySetIdOrderByOrderIndexAscIdAsc(set.getId()).size());
        return toData(set);
    }

    /** Lưu cả bài: câu có id thì sửa, không id thì thêm, câu không còn trong danh sách thì xoá. */
    @Transactional
    public SetData update(Long id, SetUpdate update) {
        TranslationSet set = findSet(id);
        if (update.title() != null && !update.title().isBlank()) set.setTitle(update.title().strip());
        if (set.getType() != TranslationSet.Type.GRAMMAR) {
            if (update.theme() != null) set.setTheme(blankToNull(update.theme()));
            if (update.level() != null) set.setLevel(update.level());
        }
        set.setStructureNote(blankToNull(update.structureNote()));
        if (update.status() != null) set.setStatus(update.status());
        set.setUpdatedAt(LocalDateTime.now());

        Map<Long, TranslationItem> existing = new HashMap<>();
        for (TranslationItem i : itemRepository.findBySetIdOrderByOrderIndexAscIdAsc(id)) existing.put(i.getId(), i);
        int order = 0;
        for (ItemData d : update.items() == null ? List.<ItemData>of() : update.items()) {
            if (d.viText() == null || d.viText().isBlank() || d.deReference() == null || d.deReference().isBlank()) {
                throw new IllegalArgumentException("Câu " + (order + 1) + " thiếu câu tiếng Việt hoặc câu tiếng Đức");
            }
            TranslationItem item = d.id() != null && existing.containsKey(d.id()) ? existing.remove(d.id()) : new TranslationItem();
            item.setSet(set);
            item.setOrderIndex(++order);
            item.setPartLabel(blankToNull(d.partLabel()));
            item.setViText(d.viText().strip());
            item.setDeReference(d.deReference().strip());
            item.setAcceptedAnswers(blankToNull(d.acceptedAnswers()));
            item.setHintKeywords(blankToNull(d.hintKeywords()));
            item.setFocus(blankToNull(d.focus()));
            String gap = blankToNull(d.gap());
            if (gap != null && !item.getDeReference().contains(gap.split("\\|")[0].strip())) {
                throw new IllegalArgumentException("Câu " + order + ": từ điền \"" + gap.split("\\|")[0].strip()
                    + "\" không có trong câu tiếng Đức");
            }
            item.setGap(gap);
            itemRepository.save(item);
        }
        itemRepository.deleteAll(existing.values());
        return toData(setRepository.save(set));
    }

    @Transactional
    public void delete(Long id) {
        setRepository.delete(findSet(id));
    }

    private TranslationSet findSet(Long id) {
        return setRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài"));
    }

    private SetData toData(TranslationSet set) {
        List<ItemData> items = itemRepository.findBySetIdOrderByOrderIndexAscIdAsc(set.getId()).stream()
            .map(i -> new ItemData(i.getId(), i.getPartLabel(), i.getViText(), i.getDeReference(), i.getAcceptedAnswers(),
                i.getHintKeywords(), i.getFocus(), i.getGap()))
            .toList();
        return new SetData(set.getId(), set.getType(), set.getLevel(), set.getTitle(), set.getTheme(),
            set.getGrammarTopic() != null ? set.getGrammarTopic().getTitleDe() : null,
            set.getStructureNote(), set.getStatus(), items);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }
}
