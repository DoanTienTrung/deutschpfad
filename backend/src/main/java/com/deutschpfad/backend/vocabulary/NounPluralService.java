package com.deutschpfad.backend.vocabulary;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * Giữ cột {@code vocabulary_items.plural} đúng sau mỗi lần admin thêm/sửa từ. Tính lại cho cả NHÓM
 * cùng {@link WordKey}, không chỉ dòng vừa lưu: thêm "die Mutter, ¨" vào giáo trình thì dòng
 * "die Mutter" sẵn có ở lộ trình tần suất cũng phải nhận "Mütter". Logic nằm ở
 * {@link NounPlural#resolveFamily} — dùng chung với migration V70.
 */
@Service
public class NounPluralService {

    private final VocabularyItemRepository vocabularyItemRepository;
    private final JdbcTemplate jdbcTemplate;

    public NounPluralService(VocabularyItemRepository vocabularyItemRepository, JdbcTemplate jdbcTemplate) {
        this.vocabularyItemRepository = vocabularyItemRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void refreshFamily(String wordKey) {
        List<VocabularyItem> family = vocabularyItemRepository.findByWordKey(wordKey);
        List<String> resolved = NounPlural.resolveFamily(
            family.stream().map(VocabularyItem::getGermanWord).toList(), this::lookup);
        for (int i = 0; i < family.size(); i++) {
            VocabularyItem item = family.get(i);
            if (!Objects.equals(item.getPlural(), resolved.get(i))) {
                item.setPlural(resolved.get(i));
                vocabularyItemRepository.save(item);
            }
        }
    }

    private String lookup(String lemma, String genus) {
        List<String> rows = jdbcTemplate.queryForList(
            "SELECT plural FROM german_noun_plurals WHERE lemma = ? AND genus = ?", String.class, lemma, genus);
        return rows.isEmpty() ? null : rows.get(0);
    }
}
