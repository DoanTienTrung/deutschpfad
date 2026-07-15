package com.deutschpfad.backend.listening;

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
 * Text-only AI helper (translation, IPA annotation, word lookup, content grading) via Groq's
 * OpenAI-compatible chat completions API. Never throws — on any failure (missing key, network
 * error, malformed response) it returns nulls so callers can proceed without blocking on AI
 * availability.
 */
@Service
public class GroqAiService {

    private static final Logger log = LoggerFactory.getLogger(GroqAiService.class);
    private static final String ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";
    private static final Pattern NUMBERED_LINE = Pattern.compile("^\\s*(\\d+)[.)]\\s*(.+?)\\s*\\|\\|\\|\\s*(.+)$");

    private final String apiKey;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record SentenceAnnotation(String phonetic, String translation) {
        static SentenceAnnotation empty() {
            return new SentenceAnnotation(null, null);
        }
    }

    public GroqAiService(@Value("${app.groq-api-key}") String apiKey) {
        this.apiKey = apiKey;
    }

    public List<SentenceAnnotation> annotateSentences(List<String> germanSentences) {
        List<SentenceAnnotation> blank = new ArrayList<>();
        germanSentences.forEach(s -> blank.add(SentenceAnnotation.empty()));

        if (apiKey == null || apiKey.isBlank() || germanSentences.isEmpty()) {
            return blank;
        }

        try {
            String content = callChat(buildSentencesPrompt(germanSentences));
            if (content == null) return blank;
            return parseAnnotatedLines(content, germanSentences.size());
        } catch (Exception e) {
            log.warn("Groq sentence annotation call failed", e);
            return blank;
        }
    }

    public String translateWord(String word, String sentenceContext) {
        if (apiKey == null || apiKey.isBlank() || word == null || word.isBlank()) return null;

        try {
            String prompt = "Trong câu tiếng Đức: \"" + sentenceContext + "\", từ \"" + word + "\" nghĩa là gì? "
                + "Trả lời NGẮN GỌN chỉ nghĩa tiếng Việt của từ đó (tối đa vài từ), không giải thích thêm, không lặp lại câu gốc.";
            String content = callChat(prompt);
            return content == null || content.isBlank() ? null : content.strip();
        } catch (Exception e) {
            log.warn("Groq word translation call failed", e);
            return null;
        }
    }

    /**
     * Grades a free-form spoken answer (already transcribed to text) against a Speaking prompt.
     * Returns Vietnamese feedback on content/grammar, or null if AI grading is unavailable.
     */
    public String gradeSpeakingAnswer(String promptText, String transcript) {
        if (apiKey == null || apiKey.isBlank() || transcript == null || transcript.isBlank()) return null;

        try {
            String prompt = "Đề bài luyện nói tiếng Đức: \"" + promptText + "\"\n"
                + "Học viên đã trả lời (đã chuyển từ giọng nói sang chữ): \"" + transcript + "\"\n"
                + "Hãy nhận xét ngắn gọn bằng tiếng Việt (3-5 câu) về nội dung câu trả lời có đúng yêu cầu đề bài "
                + "không, ngữ pháp có lỗi gì không, và gợi ý cải thiện. Nhận xét mang tính khích lệ, không quá "
                + "khắt khe vì đây là học viên đang luyện tập.";
            String content = callChat(prompt);
            return content == null || content.isBlank() ? null : content.strip();
        } catch (Exception e) {
            log.warn("Groq speaking grading call failed", e);
            return null;
        }
    }

    public record ConversationTurnText(String role, String text) {}

    /**
     * Grades a full real-time Sprechen conversation (AI partner + user, turn by turn) against a
     * Speaking prompt. Returns Vietnamese feedback covering task completion, vocabulary/grammar,
     * and coherence — pronunciation is assessed separately from Deepgram word confidence, not
     * here. Returns null if AI grading is unavailable.
     */
    public String gradeConversation(String promptText, List<ConversationTurnText> turns) {
        if (apiKey == null || apiKey.isBlank() || turns.isEmpty()) return null;

        try {
            StringBuilder transcript = new StringBuilder();
            for (ConversationTurnText turn : turns) {
                String speaker = "USER".equals(turn.role()) ? "Học viên" : "Bạn cùng thi (AI)";
                transcript.append(speaker).append(": ").append(turn.text()).append('\n');
            }

            String prompt = "Đề bài luyện nói tiếng Đức (thi theo cặp, AI đóng vai bạn cùng thi): \""
                + promptText + "\"\n\nToàn bộ cuộc hội thoại:\n" + transcript + "\n"
                + "Hãy nhận xét bằng tiếng Việt cho học viên (không nhận xét về AI) theo đúng 4 tiêu chí "
                + "thi Sprechen: (1) Hoàn thành nhiệm vụ - có đáp ứng đúng yêu cầu đề bài không; "
                + "(2) Từ vựng & ngữ pháp; (3) Sự mạch lạc, tự nhiên trong hội thoại; (4) Gợi ý cải thiện. "
                + "Với mỗi tiêu chí (1)-(3), chấm định tính \"Tốt\", \"Khá\", hoặc \"Cần luyện thêm\" kèm "
                + "1-2 câu giải thích ngắn. Trả lời đúng định dạng:\n"
                + "1. [nhãn] giải thích\n2. [nhãn] giải thích\n3. [nhãn] giải thích\n4. giải thích\n"
                + "Không thêm lời mở đầu/kết luận nào khác. Nhận xét mang tính khích lệ vì đây là học viên "
                + "đang luyện tập.";
            String content = callChat(prompt);
            return content == null || content.isBlank() ? null : content.strip();
        } catch (Exception e) {
            log.warn("Groq conversation grading call failed", e);
            return null;
        }
    }

    private String callChat(String prompt) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("model", MODEL);
        root.put("temperature", 0.3);
        ArrayNode messages = root.putArray("messages");
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(ENDPOINT))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(30))
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(root)))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            log.warn("Groq request failed: HTTP {} - {}", response.statusCode(), response.body());
            return null;
        }

        return objectMapper.readTree(response.body()).at("/choices/0/message/content").asText("");
    }

    private String buildSentencesPrompt(List<String> sentences) {
        StringBuilder sb = new StringBuilder(
            "Với mỗi câu tiếng Đức sau, cho phiên âm quốc tế IPA và bản dịch tiếng Việt tự nhiên, sát "
                + "nghĩa. Trả lời đúng định dạng \"SỐ. phiên âm IPA ||| bản dịch tiếng Việt\" mỗi câu một "
                + "dòng, không thêm giải thích hay ghi chú nào khác:\n\n"
        );
        for (int i = 0; i < sentences.size(); i++) {
            sb.append(i + 1).append(". ").append(sentences.get(i)).append('\n');
        }
        return sb.toString();
    }

    private List<SentenceAnnotation> parseAnnotatedLines(String text, int expectedCount) {
        SentenceAnnotation[] result = new SentenceAnnotation[expectedCount];
        for (String line : text.strip().split("\n")) {
            Matcher matcher = NUMBERED_LINE.matcher(line);
            if (!matcher.matches()) continue;
            int index = Integer.parseInt(matcher.group(1)) - 1;
            if (index >= 0 && index < expectedCount) {
                result[index] = new SentenceAnnotation(matcher.group(2).trim(), matcher.group(3).trim());
            }
        }
        List<SentenceAnnotation> parsed = new ArrayList<>();
        for (SentenceAnnotation value : result) parsed.add(value == null ? SentenceAnnotation.empty() : value);
        return parsed;
    }
}
