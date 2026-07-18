package com.deutschpfad.backend.listening;

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

/**
 * Third-tier text-AI fallback (after Groq, then Gemini), used only when both of those are
 * unavailable (missing key or exhausted quota). OpenRouter exposes an OpenAI-compatible chat
 * completions API, so this reuses {@link GroqAiService}'s prompt builders and response parsers
 * directly rather than duplicating them. Uses the "openrouter/free" auto-router model, which picks
 * from whichever free-tier model is currently available -- OpenRouter's free lineup rotates over
 * time, so pinning a specific ":free" model id would eventually go stale. Never throws -- returns
 * null/empty on any failure.
 */
@Service
public class OpenRouterAiService {

    private static final Logger log = LoggerFactory.getLogger(OpenRouterAiService.class);
    private static final String ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
    private static final String MODEL = "openrouter/free";

    private final String apiKey;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenRouterAiService(@Value("${app.openrouter-api-key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public List<GroqAiService.SentenceAnnotation> annotateSentences(List<String> germanSentences) {
        List<GroqAiService.SentenceAnnotation> blank = new ArrayList<>();
        germanSentences.forEach(s -> blank.add(GroqAiService.SentenceAnnotation.empty()));
        if (germanSentences.isEmpty()) return blank;

        try {
            String content = callChat(GroqAiService.buildSentencesPrompt(germanSentences));
            if (content == null) return blank;
            List<GroqAiService.SentenceAnnotation> parsed =
                GroqAiService.parseAnnotatedLines(content, germanSentences.size());
            return parsed.stream().anyMatch(a -> a.translation() != null) ? parsed : blank;
        } catch (Exception e) {
            log.warn("OpenRouter sentence annotation call failed", e);
            return blank;
        }
    }

    public List<String> translateSentencesPlain(List<String> sentences) {
        List<String> blank = new ArrayList<>();
        sentences.forEach(s -> blank.add(null));
        if (sentences.isEmpty()) return blank;

        try {
            String content = callChat(GroqAiService.buildPlainTranslationPrompt(sentences));
            if (content == null) return blank;
            List<String> parsed = GroqAiService.parsePlainTranslations(content, sentences.size());
            return parsed.stream().anyMatch(java.util.Objects::nonNull) ? parsed : blank;
        } catch (Exception e) {
            log.warn("OpenRouter plain sentence translation call failed", e);
            return blank;
        }
    }

    public String translateWord(String word, String sentenceContext) {
        if (word == null || word.isBlank()) return null;
        try {
            String content = callChat(GroqAiService.buildWordTranslationPrompt(word, sentenceContext));
            return content == null || content.isBlank() ? null : content.strip();
        } catch (Exception e) {
            log.warn("OpenRouter word translation call failed", e);
            return null;
        }
    }

    public VocabLookupResult lookupNewWord(String germanWord) {
        if (germanWord == null || germanWord.isBlank()) return null;
        try {
            String content = callChat(GroqAiService.buildVocabLookupPrompt(germanWord));
            if (content == null) return null;
            return GroqAiService.parseVocabLookupLine(content);
        } catch (Exception e) {
            log.warn("OpenRouter vocab lookup call failed", e);
            return null;
        }
    }

    public List<com.deutschpfad.backend.reading.ReadingQuestionInput> generateReadingQuestions(String content) {
        if (content == null || content.isBlank()) return List.of();
        try {
            String response = callChat(GroqAiService.buildReadingQuestionsPrompt(content));
            if (response == null) return List.of();
            return GroqAiService.parseReadingQuestions(response);
        } catch (Exception e) {
            log.warn("OpenRouter reading question generation failed", e);
            return List.of();
        }
    }

    public String generateReadingPassage(String topic, String level) {
        if (topic == null || topic.isBlank()) return null;
        try {
            String response = callChat(GroqAiService.buildReadingPassagePrompt(topic, level));
            return response == null || response.isBlank() ? null : response.strip();
        } catch (Exception e) {
            log.warn("OpenRouter reading passage generation failed", e);
            return null;
        }
    }

    private String callChat(String prompt) throws Exception {
        if (apiKey == null || apiKey.isBlank()) return null;

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
            .header("HTTP-Referer", "https://deutschpfad.local")
            .header("X-Title", "DeutschPfad")
            .timeout(Duration.ofSeconds(30))
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(root)))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            log.warn("OpenRouter request failed: HTTP {} - {}", response.statusCode(), response.body());
            return null;
        }

        return objectMapper.readTree(response.body()).at("/choices/0/message/content").asText("");
    }
}
