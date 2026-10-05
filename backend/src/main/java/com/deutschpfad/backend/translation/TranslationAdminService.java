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

/** Admin: xem bài luyện dịch theo chủ điểm ngữ pháp, AI soạn nháp câu, sửa và đăng. */
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

    public record ItemData(Long id, String partLabel, String viText, String deReference, String acceptedAnswers, String hintKeywords) {}

    public record SetData(
        Long id, TranslationSet.Type type, VocabularyItem.Level level, String title, String grammarTitleDe,
        String structureNote, TranslationSet.Status status, List<ItemData> items
    ) {}

    public record SetUpdate(String title, String structureNote, TranslationSet.Status status, List<ItemData> items) {}

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

        int next = itemRepository.findBySetIdOrderByOrderIndexAscIdAsc(set.getId()).size();
        for (TranslationAiPrompts.DraftItem d : draft.items()) {
            TranslationItem item = new TranslationItem();
            item.setSet(set);
            item.setOrderIndex(++next);
            item.setViText(d.viText());
            item.setDeReference(d.deReference());
            item.setAcceptedAnswers(d.alternatives().isEmpty() ? null : String.join("\n", d.alternatives()));
            item.setHintKeywords(d.keywords());
            itemRepository.save(item);
        }
        return toData(set);
    }

    /** Lưu cả bài: câu có id thì sửa, không id thì thêm, câu không còn trong danh sách thì xoá. */
    @Transactional
    public SetData update(Long id, SetUpdate update) {
        TranslationSet set = findSet(id);
        if (update.title() != null && !update.title().isBlank()) set.setTitle(update.title().strip());
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
            .map(i -> new ItemData(i.getId(), i.getPartLabel(), i.getViText(), i.getDeReference(), i.getAcceptedAnswers(), i.getHintKeywords()))
            .toList();
        return new SetData(set.getId(), set.getType(), set.getLevel(), set.getTitle(),
            set.getGrammarTopic() != null ? set.getGrammarTopic().getTitleDe() : null,
            set.getStructureNote(), set.getStatus(), items);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }
}
