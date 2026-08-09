package com.deutschpfad.backend.tutor;

import com.deutschpfad.backend.listening.GroqAiService;
import com.deutschpfad.backend.vocabulary.GermanNounGenderRepository;
import com.deutschpfad.backend.vocabulary.GermanNounGenderService;
import com.deutschpfad.backend.vocabulary.VocabLookupCache;
import com.deutschpfad.backend.vocabulary.VocabLookupCacheRepository;
import com.deutschpfad.backend.vocabulary.VocabLookupResult;
import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

/**
 * Tool cho AI gọi khi cần tra chính xác (không đoán qua ngữ cảnh RAG). Bọc lại logic tra từ đã
 * có sẵn ở package vocabulary (UserDeckController/GermanNounGenderService) — không viết lại,
 * không đụng gì tới code cũ.
 */
@Component
public class TutorTools {

    private final GroqAiService groqAiService;
    private final GermanNounGenderRepository nounGenderRepository;
    private final GermanNounGenderService nounGenderService;
    private final VocabLookupCacheRepository lookupCacheRepository;

    public TutorTools(
            GroqAiService groqAiService,
            GermanNounGenderRepository nounGenderRepository,
            GermanNounGenderService nounGenderService,
            VocabLookupCacheRepository lookupCacheRepository) {
        this.groqAiService = groqAiService;
        this.nounGenderRepository = nounGenderRepository;
        this.nounGenderService = nounGenderService;
        this.lookupCacheRepository = lookupCacheRepository;
    }

    @Tool("Tra nghĩa tiếng Việt, loại từ, ví dụ câu của 1 từ tiếng Đức cụ thể")
    public String lookupGermanWord(String word) {
        String normalizedWord = word.trim().toLowerCase();

        VocabLookupResult result = lookupCacheRepository.findByWordAndWordTypeHint(normalizedWord, "")
                .map(VocabLookupCache::toResult)
                .orElse(null);

        if (result == null) {
            result = groqAiService.lookupNewWord(word, null);
            if (result == null) {
                return "Không tra được từ \"" + word + "\".";
            }
            result = nounGenderService.correctArticle(result);
            lookupCacheRepository.save(VocabLookupCache.from(normalizedWord, "", result));
        }

        return formatResult(result);
    }

    @Tool("Tra giống der/die/das của 1 danh từ tiếng Đức (không kèm mạo từ)")
    public String lookupNounGender(String noun) {
        return nounGenderRepository.findByLemma(noun.trim().toLowerCase())
                .map(entry -> {
                    String article = switch (entry.getGenus()) {
                        case "m" -> "der";
                        case "f" -> "die";
                        case "n" -> "das";
                        default -> "?";
                    };
                    return article + " " + noun;
                })
                .orElse("Không tìm thấy \"" + noun + "\" trong bảng tra giống danh từ.");
    }

    private String formatResult(VocabLookupResult result) {
        StringBuilder sb = new StringBuilder();
        sb.append(result.germanWord());
        if (result.wordType() != null) {
            sb.append(" (").append(result.wordType()).append(")");
        }
        sb.append(": ").append(result.vietnameseMeaning());
        if (result.exampleSentence() != null && !result.exampleSentence().isBlank()) {
            sb.append(". Ví dụ: ").append(result.exampleSentence());
        }
        return sb.toString();
    }
}
