package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabAuditInput;
import com.deutschpfad.backend.vocabulary.VocabAuditResult;
import com.deutschpfad.backend.vocabulary.VocabLookupResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Alternate AI provider for the one-off vocabulary audit batch job — used instead of
 * {@link GroqAiService} because Groq's free tier daily token budget (100k TPD) is far too small
 * to audit thousands of vocabulary entries in a reasonable number of days. Same never-throws
 * contract as GroqAiService: any failure returns the input unchanged.
 */
@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);
    private static final String ENDPOINT_TEMPLATE =
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    private static final String MODEL = "gemini-2.5-flash-lite";
    private static final Pattern LINE_PATTERN = Pattern.compile("^\\s*(\\d+)[.)]\\s*(.+)$");

    private final String apiKey;
    private final OpenRouterAiService openRouterAiService;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiAiService(@Value("${app.gemini-api-key:}") String apiKey, OpenRouterAiService openRouterAiService) {
        this.apiKey = apiKey;
        this.openRouterAiService = openRouterAiService;
    }

    public List<VocabAuditResult> auditVocabularyItems(List<VocabAuditInput> items) {
        List<VocabAuditResult> unchanged = items.stream().map(VocabAuditResult::unchanged).toList();
        if (apiKey == null || apiKey.isBlank() || items.isEmpty()) return unchanged;

        try {
            String content = callGenerateContent(buildVocabAuditPrompt(items));
            if (content == null) return unchanged;
            return parseVocabAuditLines(content, items);
        } catch (Exception e) {
            log.warn("Gemini vocabulary audit call failed", e);
            return unchanged;
        }
    }

    /**
     * Fallback path for {@link GroqAiService#annotateSentences}, used when Groq's daily token
     * quota is exhausted. Same "SỐ. phiên âm ||| bản dịch" line format and never-throws contract.
     */
    public List<GroqAiService.SentenceAnnotation> annotateSentences(List<String> germanSentences) {
        List<GroqAiService.SentenceAnnotation> blank = new ArrayList<>();
        germanSentences.forEach(s -> blank.add(GroqAiService.SentenceAnnotation.empty()));
        if (germanSentences.isEmpty()) return blank;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String content = callGenerateContent(buildSentencesPrompt(germanSentences));
                if (content != null) {
                    List<GroqAiService.SentenceAnnotation> parsed = parseAnnotatedLines(content, germanSentences.size());
                    if (parsed.stream().anyMatch(a -> a.translation() != null)) return parsed;
                }
            } catch (Exception e) {
                log.warn("Gemini sentence annotation call failed", e);
            }
        }

        log.warn("Falling back to OpenRouter for sentence annotation ({} sentences)", germanSentences.size());
        return openRouterAiService.annotateSentences(germanSentences);
    }

    /** Fallback path for {@link GroqAiService#translateWord}, used when Groq's daily quota is exhausted. */
    public String translateWord(String word, String sentenceContext) {
        if (word == null || word.isBlank()) return null;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String content = callGenerateContent(GroqAiService.buildWordTranslationPrompt(word, sentenceContext));
                if (content != null && !content.isBlank()) return content.strip();
            } catch (Exception e) {
                log.warn("Gemini word translation call failed", e);
            }
        }

        log.warn("Falling back to OpenRouter for word translation ({})", word);
        return openRouterAiService.translateWord(word, sentenceContext);
    }

    /**
     * Fallback path for {@link GroqAiService#lookupNewWord}, used when Groq's daily quota is
     * exhausted. Reuses Groq's exact prompt/parsing (same "8 fields separated by |||" format) so
     * the two providers stay interchangeable from the caller's perspective.
     */
    public VocabLookupResult lookupNewWord(String germanWord) {
        if (germanWord == null || germanWord.isBlank()) return null;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String content = callGenerateContent(GroqAiService.buildVocabLookupPrompt(germanWord));
                if (content != null) {
                    VocabLookupResult result = GroqAiService.parseVocabLookupLine(content);
                    if (result != null) return result;
                }
            } catch (Exception e) {
                log.warn("Gemini vocab lookup call failed", e);
            }
        }

        log.warn("Falling back to OpenRouter for vocab lookup ({})", germanWord);
        return openRouterAiService.lookupNewWord(germanWord);
    }

    /** Fallback path for {@link GroqAiService#generateReadingQuestions}, used when Groq's daily quota is exhausted. */
    public List<com.deutschpfad.backend.reading.ReadingQuestionInput> generateReadingQuestions(String content) {
        if (content == null || content.isBlank()) return List.of();

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String response = callGenerateContent(GroqAiService.buildReadingQuestionsPrompt(content));
                if (response != null) {
                    List<com.deutschpfad.backend.reading.ReadingQuestionInput> parsed =
                        GroqAiService.parseReadingQuestions(response);
                    if (!parsed.isEmpty()) return parsed;
                }
            } catch (Exception e) {
                log.warn("Gemini reading question generation failed", e);
            }
        }

        log.warn("Falling back to OpenRouter for reading question generation");
        return openRouterAiService.generateReadingQuestions(content);
    }

    /** Fallback path for {@link GroqAiService#generateReadingPassage}, used when Groq's daily quota is exhausted. */
    public String generateReadingPassage(String topic, String level) {
        if (topic == null || topic.isBlank()) return null;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String response = callGenerateContent(GroqAiService.buildReadingPassagePrompt(topic, level));
                if (response != null && !response.isBlank()) return response.strip();
            } catch (Exception e) {
                log.warn("Gemini reading passage generation failed", e);
            }
        }

        log.warn("Falling back to OpenRouter for reading passage generation");
        return openRouterAiService.generateReadingPassage(topic, level);
    }

    /** Fallback path for {@link GroqAiService#translateSentencesPlain}, used when Groq's daily quota is exhausted. */
    public List<String> translateSentencesPlain(List<String> sentences) {
        List<String> blank = new ArrayList<>();
        sentences.forEach(s -> blank.add(null));
        if (sentences.isEmpty()) return blank;

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String content = callGenerateContent(GroqAiService.buildPlainTranslationPrompt(sentences));
                if (content != null) {
                    List<String> parsed = GroqAiService.parsePlainTranslations(content, sentences.size());
                    if (parsed.stream().anyMatch(java.util.Objects::nonNull)) return parsed;
                }
            } catch (Exception e) {
                log.warn("Gemini plain sentence translation call failed", e);
            }
        }

        log.warn("Falling back to OpenRouter for plain sentence translation ({} sentences)", sentences.size());
        return openRouterAiService.translateSentencesPlain(sentences);
    }

    private String buildSentencesPrompt(List<String> sentences) {
        StringBuilder sb = new StringBuilder(
            "Với mỗi câu tiếng Đức sau, cho phiên âm quốc tế IPA và bản dịch tiếng Việt tự nhiên, sát "
                + "nghĩa. Trả lời đúng định dạng \"SỐ. phiên âm IPA ||| bản dịch tiếng Việt\" mỗi câu một "
                + "dòng duy nhất, không thêm giải thích hay ghi chú nào khác. QUAN TRỌNG: một số câu "
                + "tiếng Đức bên dưới có thể chứa nhiều dấu chấm câu bên trong (ví dụ do gộp từ 2 câu "
                + "gốc) — dù vậy vẫn phải trả lời TRỌN VẸN cả câu đó trên đúng MỘT dòng, tuyệt đối "
                + "không xuống dòng giữa chừng dù bản dịch dài. QUAN TRỌNG VỀ SỐ: nếu câu có số viết "
                + "dạng chữ số (vd \"13\", \"114\", \"08.45\"), trước tiên phải đọc thành lời tiếng Đức "
                + "đúng ngữ cảnh (vd \"13\" → \"dreizehn\", \"114\" → \"einhundertvierzehn\", \"08.45\" "
                + "giờ → \"acht Uhr fünfundvierzig\"), rồi mới phiên âm IPA của cách đọc đó — không được "
                + "bỏ sót số, không được phiên âm thành từ khác không liên quan:\n\n"
        );
        for (int i = 0; i < sentences.size(); i++) {
            sb.append(i + 1).append(". ").append(sentences.get(i)).append('\n');
        }
        return sb.toString();
    }

    private static final Pattern NUMBERED_LINE = Pattern.compile("^\\s*(\\d+)[.)]\\s*(.+?)\\s*\\|\\|\\|\\s*(.+)$");

    private List<GroqAiService.SentenceAnnotation> parseAnnotatedLines(String text, int expectedCount) {
        GroqAiService.SentenceAnnotation[] result = new GroqAiService.SentenceAnnotation[expectedCount];
        // Assign by line-match order, not by the model's own printed number -- see the identical
        // comment in GroqAiService.parseAnnotatedLines for why trusting the declared number can
        // cascade a wrong-translation shift across every following sentence.
        int position = -1;
        for (String line : text.strip().split("\n")) {
            Matcher matcher = NUMBERED_LINE.matcher(line);
            if (!matcher.matches()) {
                if (position >= 0 && !line.isBlank()) {
                    GroqAiService.SentenceAnnotation prev = result[position];
                    if (prev != null) {
                        String addition = line.trim();
                        int sep = addition.lastIndexOf("|||");
                        if (sep >= 0) addition = addition.substring(sep + 3).trim();
                        if (!addition.isEmpty()) {
                            result[position] = new GroqAiService.SentenceAnnotation(
                                prev.phonetic(), prev.translation() + " " + addition);
                        }
                    }
                }
                continue;
            }
            position++;
            if (position < expectedCount) {
                result[position] = new GroqAiService.SentenceAnnotation(matcher.group(2).trim(), matcher.group(3).trim());
            }
        }
        List<GroqAiService.SentenceAnnotation> parsed = new ArrayList<>();
        for (GroqAiService.SentenceAnnotation value : result) {
            parsed.add(value == null ? GroqAiService.SentenceAnnotation.empty() : value);
        }
        return parsed;
    }

    private String callGenerateContent(String prompt) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode contents = root.putArray("contents");
        ObjectNode contentNode = contents.addObject();
        ArrayNode parts = contentNode.putArray("parts");
        parts.addObject().put("text", prompt);

        String uri = String.format(ENDPOINT_TEMPLATE, MODEL, apiKey);
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(uri))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(30))
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(root)))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            log.warn("Gemini request failed: HTTP {} - {}", response.statusCode(), response.body());
            return null;
        }

        return objectMapper.readTree(response.body())
            .at("/candidates/0/content/parts/0/text").asText("");
    }

    private String buildVocabAuditPrompt(List<VocabAuditInput> items) {
        StringBuilder sb = new StringBuilder(
            "Bạn là chuyên gia tiếng Đức. Với mỗi từ vựng tiếng Đức sau (kèm loại từ, nghĩa tiếng Việt, "
                + "nghĩa tiếng Anh, phiên âm IPA, câu ví dụ hiện có), hãy:\n"
                + "1. Kiểm tra nghĩa tiếng Việt có chính xác không, sửa lại nếu sai (nếu đúng thì giữ nguyên).\n"
                + "2. Kiểm tra nghĩa tiếng Anh có chính xác không (nếu ô này trống thì để trống, không tự bịa "
                + "thêm), sửa lại nếu sai.\n"
                + "3. Kiểm tra phiên âm IPA có đúng không, sửa lại nếu sai.\n"
                + "4. Kiểm tra câu ví dụ có đúng ngữ pháp tiếng Đức VÀ có thực sự dùng đúng từ đó (ở dạng "
                + "chia/biến đổi phù hợp) hay không — nếu câu sai hoặc không dùng từ đó, HÃY VIẾT LẠI câu ví "
                + "dụ mới hoàn toàn đúng ngữ pháp và tự nhiên; nếu câu đã đúng thì giữ nguyên y hệt.\n"
                + "5. QUAN TRỌNG: trường cuối PHẢI là 1 chuỗi ký tự COPY Y HỆT (character-by-character, "
                + "không đổi 1 chữ nào) từ câu_ví_dụ ở trên (câu đã sửa nếu có) — không thêm mạo từ "
                + "(der/die/das/ein...), không đưa về dạng nguyên mẫu/từ điển, không thêm dấu câu. Nếu từ đó "
                + "là động từ tách (như \"aufwachen\" → \"wache ... auf\" trong câu), chỉ copy đúng phần gốc "
                + "liền nhau xuất hiện trong câu (vd \"wache\"), KHÔNG ghép 2 phần rời rạc lại với nhau. Nếu "
                + "không copy được chính xác 1 cụm liên tục nào trong câu, để trống trường này thay vì đoán.\n\n"
                + "Trả lời đúng định dạng, mỗi từ 1 dòng, các trường cách nhau bởi \" ||| \" theo đúng thứ tự: "
                + "SỐ. nghĩa_tiếng_việt ||| nghĩa_tiếng_anh ||| phiên_âm_IPA ||| câu_ví_dụ ||| từ_được_gạch_chân\n"
                + "Không thêm giải thích hay ghi chú nào khác ngoài các dòng đúng định dạng trên.\n\n"
        );
        for (int i = 0; i < items.size(); i++) {
            VocabAuditInput item = items.get(i);
            sb.append(i + 1).append(". Từ: ").append(item.germanWord())
                .append(" (").append(item.wordType() == null ? "?" : item.wordType()).append(")")
                .append(" | Nghĩa VI: ").append(item.vietnameseMeaning())
                .append(" | Nghĩa EN: ").append(item.englishMeaning() == null ? "" : item.englishMeaning())
                .append(" | IPA: ").append(item.phonetic() == null ? "" : item.phonetic())
                .append(" | Câu ví dụ: ").append(item.exampleSentence() == null ? "" : item.exampleSentence())
                .append('\n');
        }
        return sb.toString();
    }

    private List<VocabAuditResult> parseVocabAuditLines(String text, List<VocabAuditInput> items) {
        VocabAuditResult[] result = new VocabAuditResult[items.size()];
        for (String line : text.strip().split("\n")) {
            Matcher matcher = LINE_PATTERN.matcher(line);
            if (!matcher.matches()) continue;
            int index = Integer.parseInt(matcher.group(1)) - 1;
            if (index < 0 || index >= items.size()) continue;

            String[] parts = matcher.group(2).split("\\s*\\|\\|\\|\\s*", -1);
            if (parts.length < 5) continue;

            String sentence = parts[3].trim();
            String highlight = parts[4].trim();
            boolean verified = !highlight.isEmpty() && sentence.toLowerCase().contains(highlight.toLowerCase());

            result[index] = new VocabAuditResult(
                parts[0].trim(),
                parts[1].trim().isEmpty() ? null : parts[1].trim(),
                parts[2].trim(),
                sentence,
                verified ? highlight : null
            );
        }
        List<VocabAuditResult> parsed = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            parsed.add(result[i] == null ? VocabAuditResult.unchanged(items.get(i)) : result[i]);
        }
        return parsed;
    }
}
