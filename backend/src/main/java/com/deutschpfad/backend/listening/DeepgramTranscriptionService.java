package com.deutschpfad.backend.listening;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * Transcribes short recorded audio clips (Shadowing/Speaking attempts) via Deepgram's Nova-3
 * speech-to-text API. Audio is sent in-memory for a single request/response and never persisted
 * on the server. Never throws — returns null on any failure so callers can surface a graceful
 * error instead of a 500.
 */
@Service
public class DeepgramTranscriptionService {

    private static final Logger log = LoggerFactory.getLogger(DeepgramTranscriptionService.class);
    private static final String ENDPOINT =
        "https://api.deepgram.com/v1/listen?model=nova-3&language=de&smart_format=true";

    private final String apiKey;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public record WordConfidence(String word, double confidence) {}

    public record TranscriptionResult(String transcript, List<WordConfidence> words) {}

    public DeepgramTranscriptionService(@Value("${app.deepgram-api-key}") String apiKey) {
        this.apiKey = apiKey;
    }

    public String transcribe(byte[] audioBytes, String contentType) {
        JsonNode alternative = requestTranscription(audioBytes, contentType);
        if (alternative == null) return null;
        String transcript = alternative.path("transcript").asText("");
        return transcript.isBlank() ? null : transcript;
    }

    public TranscriptionResult transcribeWithConfidence(byte[] audioBytes, String contentType) {
        JsonNode alternative = requestTranscription(audioBytes, contentType);
        if (alternative == null) return null;

        String transcript = alternative.path("transcript").asText("");
        if (transcript.isBlank()) return null;

        List<WordConfidence> words = new ArrayList<>();
        for (JsonNode wordNode : alternative.path("words")) {
            String word = wordNode.path("punctuated_word").asText(wordNode.path("word").asText(""));
            double confidence = wordNode.path("confidence").asDouble(0.0);
            if (!word.isBlank()) words.add(new WordConfidence(word, confidence));
        }
        return new TranscriptionResult(transcript, words);
    }

    private JsonNode requestTranscription(byte[] audioBytes, String contentType) {
        if (apiKey == null || apiKey.isBlank() || audioBytes.length == 0) return null;

        try {
            // Strip codec parameters (e.g. ";codecs=opus") — Deepgram's container auto-detection
            // expects a bare MIME type like "audio/webm", not one with extra parameters.
            String baseContentType = contentType != null && !contentType.isBlank()
                ? contentType.split(";")[0].trim()
                : "audio/webm";

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ENDPOINT))
                .header("Authorization", "Token " + apiKey)
                .header("Content-Type", baseContentType)
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofByteArray(audioBytes))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Deepgram transcription request failed: HTTP {} - {}", response.statusCode(), response.body());
                return null;
            }

            return objectMapper.readTree(response.body()).at("/results/channels/0/alternatives/0");
        } catch (Exception e) {
            log.warn("Deepgram transcription call failed", e);
            return null;
        }
    }
}
