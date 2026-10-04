package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.TestcontainersConfiguration;
import com.deutschpfad.backend.listening.GroqAiService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class ExampleTranslationJobTest {

    @Autowired private ExampleTranslationJob job;
    @Autowired private VocabularyItemRepository itemRepository;
    @MockitoBean private GroqAiService aiService;

    @Test
    void dichCauConThieu_cauTrungChiGuiMotLan_cauDaDichThiDungLai() throws Exception {
        when(aiService.translateSentencesPlainPrimaryOnly(anyList())).thenAnswer(inv -> {
            List<String> in = inv.getArgument(0);
            return in.stream().map(s -> "VI: " + s).toList();
        });
        VocabularyItem dog1 = item("der Hund", "Ich habe einen Hund.", null);
        VocabularyItem dog2 = item("der Hund", "Ich habe einen Hund.", null);
        item("wie", "Wie geht's?", "Khỏe không?");
        VocabularyItem how = item("gehen", "Wie geht's?", null);

        runToEnd();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<String>> sent = ArgumentCaptor.forClass(List.class);
        verify(aiService, atLeastOnce()).translateSentencesPlainPrimaryOnly(sent.capture());
        List<String> allSent = new ArrayList<>();
        sent.getAllValues().forEach(allSent::addAll);
        assertThat(allSent).as("câu trùng chỉ gửi một lần").containsOnlyOnce("Ich habe einen Hund.");
        assertThat(allSent).as("câu đã có bản dịch ở dòng khác thì không gọi AI").doesNotContain("Wie geht's?");

        assertThat(vi(dog1)).isEqualTo("VI: Ich habe einen Hund.");
        assertThat(vi(dog2)).isEqualTo("VI: Ich habe einen Hund.");
        assertThat(vi(how)).isEqualTo("Khỏe không?");
    }

    @Test
    void aiKhongDichDuocGi_thiDung_khongGhiGi() throws Exception {
        when(aiService.translateSentencesPlainPrimaryOnly(anyList())).thenAnswer(inv -> {
            List<String> in = inv.getArgument(0);
            List<String> nulls = new ArrayList<>();
            in.forEach(s -> nulls.add(null));
            return nulls;
        });
        VocabularyItem word = item("das Haus", "Das Haus ist groß.", null);

        runToEnd();

        assertThat(vi(word)).isNull();
        assertThat(job.status().get("stopReason")).asString().contains("dừng");
    }

    @Test
    void doiCauViDu_thiBoBanDichCu() {
        VocabularyItem word = item("das Auto", "Das Auto ist rot.", "Chiếc xe màu đỏ.");
        word.setExampleSentence("Das Auto ist blau.");
        assertThat(word.getExampleSentenceVi()).isNull();

        word.setExampleSentenceVi("Chiếc xe màu xanh.");
        word.setExampleSentence("Das Auto ist blau.");
        assertThat(word.getExampleSentenceVi()).as("đặt lại đúng câu cũ không xoá bản dịch").isEqualTo("Chiếc xe màu xanh.");
    }

    private void runToEnd() throws InterruptedException {
        assertThat(job.start()).isGreaterThanOrEqualTo(0);
        for (int i = 0; i < 200 && Boolean.TRUE.equals(job.status().get("running")); i++) {
            Thread.sleep(100);
        }
        assertThat(job.status().get("running")).isEqualTo(false);
    }

    private VocabularyItem item(String germanWord, String example, String vi) {
        VocabularyItem item = new VocabularyItem();
        item.setGermanWord(germanWord);
        item.setVietnameseMeaning("(kiểm thử)");
        item.setLevel(VocabularyItem.Level.A1);
        item.setExampleSentence(example);
        item.setExampleSentenceVi(vi);
        return itemRepository.save(item);
    }

    private String vi(VocabularyItem item) {
        return itemRepository.findById(item.getId()).orElseThrow().getExampleSentenceVi();
    }
}
