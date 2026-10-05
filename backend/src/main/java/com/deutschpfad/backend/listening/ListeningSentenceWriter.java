package com.deutschpfad.backend.listening;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Ghi câu của một bài nghe từ phụ đề đã tách: text, mốc thời gian, IPA (espeak-ng) và bản dịch nếu có.
 * Dùng chung cho form nhập tay trong admin và job nhập hàng loạt (job lưu câu trước, dịch sau).
 */
@Service
public class ListeningSentenceWriter {

    private final ListeningSentenceRepository sentenceRepository;
    private final EspeakPhoneticService phoneticService;

    public ListeningSentenceWriter(ListeningSentenceRepository sentenceRepository, EspeakPhoneticService phoneticService) {
        this.sentenceRepository = sentenceRepository;
        this.phoneticService = phoneticService;
    }

    /**
     * Thay toàn bộ câu của bài. {@code annotations} null = chưa dịch (job dịch sau); nếu có thì cùng độ dài
     * với {@code parsed}. IPA lấy từ espeak-ng, chỉ dùng IPA của AI khi espeak không chạy được.
     */
    @Transactional
    public List<ListeningSentence> replaceSentences(
        ListeningExercise exercise,
        List<TranscriptParser.SentenceData> parsed,
        List<GroqAiService.SentenceAnnotation> annotations
    ) {
        sentenceRepository.deleteByExerciseId(exercise.getId());
        List<ListeningSentence> saved = new ArrayList<>();
        for (int i = 0; i < parsed.size(); i++) {
            TranscriptParser.SentenceData data = parsed.get(i);
            GroqAiService.SentenceAnnotation annotation = annotations != null ? annotations.get(i) : null;
            ListeningSentence sentence = new ListeningSentence();
            sentence.setExercise(exercise);
            sentence.setOrderIndex(i);
            sentence.setText(data.text());
            sentence.setStartSeconds(data.startSeconds());
            sentence.setEndSeconds(data.endSeconds());
            sentence.setTranslation(annotation != null ? annotation.translation() : null);
            String phonetic = phoneticService.phonetic(data.text());
            sentence.setPhonetic(phonetic != null ? phonetic : annotation != null ? annotation.phonetic() : null);
            saved.add(sentenceRepository.save(sentence));
        }
        return saved;
    }
}
