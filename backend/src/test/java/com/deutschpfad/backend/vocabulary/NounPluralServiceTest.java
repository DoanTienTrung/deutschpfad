package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/** Bảng Wiktionary thật (nạp ở V70) + tính lại theo nhóm cùng khoá khi admin lưu. */
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class NounPluralServiceTest {

    @Autowired private NounPluralService nounPluralService;
    @Autowired private VocabularyItemRepository itemRepository;

    @Test
    void traBangWiktionaryDaNap() {
        VocabularyItem auto = save("das Auto");
        assertThat(plural(auto)).isEqualTo("Autos");
    }

    @Test
    void tuCoHaiSoNhieu_khongDoan() {
        VocabularyItem bank = save("die Bank");
        assertThat(plural(bank)).as("Bänke (ghế) hay Banken (ngân hàng)?").isNull();
    }

    @Test
    void themDongGiaoTrinh_capNhatCaDongCuCungTu() {
        VocabularyItem frequency = save("die Mutter");
        assertThat(plural(frequency)).isNull();

        save("die Mutter, ¨");

        assertThat(plural(frequency)).isEqualTo("Mütter");
    }

    private VocabularyItem save(String germanWord) {
        VocabularyItem item = new VocabularyItem();
        item.setGermanWord(germanWord);
        item.setVietnameseMeaning("(kiểm thử)");
        item.setLevel(VocabularyItem.Level.A1);
        VocabularyItem saved = itemRepository.save(item);
        nounPluralService.refreshFamily(saved.getWordKey());
        return saved;
    }

    private String plural(VocabularyItem item) {
        return itemRepository.findById(item.getId()).orElseThrow().getPlural();
    }
}
