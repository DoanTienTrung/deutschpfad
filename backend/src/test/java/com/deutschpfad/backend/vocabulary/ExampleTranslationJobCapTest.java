package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.listening.GroqAiService;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.LongStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Giới hạn số câu mỗi lượt + không bao giờ dùng chuỗi fallback (Gemini/OpenRouter). */
class ExampleTranslationJobCapTest {

    @Test
    void moiLuotChiDichToiDaMaxPerRun_vaChiGoiGroq() throws Exception {
        VocabularyItemRepository repo = mock(VocabularyItemRepository.class);
        GroqAiService ai = mock(GroqAiService.class);
        List<Long> missing = LongStream.rangeClosed(1, 5).boxed().toList();
        when(repo.findIdsMissingExampleTranslation()).thenReturn(missing);
        when(repo.findTranslatedExamples()).thenReturn(List.of());
        when(repo.findAllById(anyList())).thenAnswer(inv -> {
            List<VocabularyItem> items = new ArrayList<>();
            for (Long id : inv.<List<Long>>getArgument(0)) {
                VocabularyItem item = new VocabularyItem();
                item.setExampleSentence("Satz " + id);
                items.add(item);
            }
            return items;
        });
        when(ai.translateSentencesPlainPrimaryOnly(anyList()))
            .thenAnswer(inv -> inv.<List<String>>getArgument(0).stream().map(s -> "Câu " + s).toList());

        ExampleTranslationJob job = new ExampleTranslationJob(repo, ai, 2);
        assertThat(job.start()).isEqualTo(2);
        for (int i = 0; i < 100 && Boolean.TRUE.equals(job.status().get("running")); i++) Thread.sleep(50);

        assertThat(job.status().get("translated")).isEqualTo(2);
        assertThat(job.status().get("stopReason")).asString().contains("ngày mai");
        verify(ai, never()).translateSentencesPlain(anyList());
    }
}
