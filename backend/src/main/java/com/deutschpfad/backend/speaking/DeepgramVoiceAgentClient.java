package com.deutschpfad.backend.speaking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

/**
 * Opens a real-time WebSocket connection to Deepgram's Voice Agent API (bundled STT + LLM + TTS,
 * used here with Groq as the "think" LLM provider). One connection per live Sprechen call. Never
 * throws synchronously — connection failures surface via the returned {@link CompletableFuture}
 * or the {@link Listener#onError} callback so the caller can degrade gracefully.
 */
@Service
public class DeepgramVoiceAgentClient {

    private static final Logger log = LoggerFactory.getLogger(DeepgramVoiceAgentClient.class);
    private static final URI ENDPOINT = URI.create("wss://agent.deepgram.com/v1/agent/converse");

    private final String apiKey;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DeepgramVoiceAgentClient(@Value("${app.deepgram-api-key}") String apiKey) {
        this.apiKey = apiKey;
    }

    public interface Listener {
        void onAudio(byte[] audio);
        void onConversationText(String role, String content);
        void onUserStartedSpeaking();
        void onAgentStartedSpeaking();
        void onAgentAudioDone();
        void onError(String message);
        void onClose();
    }

    public CompletableFuture<VoiceAgentSession> connect(String settingsJson, Listener listener) {
        if (apiKey == null || apiKey.isBlank()) {
            return CompletableFuture.failedFuture(new IllegalStateException("Deepgram API key chưa cấu hình"));
        }

        StringBuilder textBuffer = new StringBuilder();
        WebSocket.Listener wsListener = new WebSocket.Listener() {
            @Override
            public CompletionStage<?> onBinary(WebSocket webSocket, ByteBuffer data, boolean last) {
                byte[] bytes = new byte[data.remaining()];
                data.get(bytes);
                listener.onAudio(bytes);
                webSocket.request(1);
                return null;
            }

            @Override
            public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
                textBuffer.append(data);
                if (last) {
                    handleEvent(textBuffer.toString(), listener);
                    textBuffer.setLength(0);
                }
                webSocket.request(1);
                return null;
            }

            @Override
            public void onError(WebSocket webSocket, Throwable error) {
                log.warn("Deepgram Voice Agent WS error", error);
                listener.onError(error.getMessage());
            }

            @Override
            public CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
                listener.onClose();
                return null;
            }
        };

        return httpClient.newWebSocketBuilder()
            .header("Authorization", "Token " + apiKey)
            .connectTimeout(Duration.ofSeconds(10))
            .buildAsync(ENDPOINT, wsListener)
            .thenApply(webSocket -> {
                webSocket.sendText(settingsJson, true);
                return new VoiceAgentSession(webSocket);
            });
    }

    private void handleEvent(String json, Listener listener) {
        try {
            JsonNode node = objectMapper.readTree(json);
            String type = node.path("type").asText("");
            log.info("Deepgram Voice Agent event: {}", json);
            switch (type) {
                case "ConversationText" -> listener.onConversationText(
                    node.path("role").asText(""), node.path("content").asText("")
                );
                case "UserStartedSpeaking" -> listener.onUserStartedSpeaking();
                case "AgentStartedSpeaking" -> listener.onAgentStartedSpeaking();
                case "AgentAudioDone" -> listener.onAgentAudioDone();
                case "Error" -> listener.onError(node.path("description").asText(""));
                default -> { }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Deepgram Voice Agent event: {}", json, e);
        }
    }

    public static class VoiceAgentSession {
        private final WebSocket webSocket;

        VoiceAgentSession(WebSocket webSocket) {
            this.webSocket = webSocket;
        }

        public void sendAudio(byte[] audio) {
            webSocket.sendBinary(ByteBuffer.wrap(audio), true);
        }

        public void close() {
            webSocket.sendClose(WebSocket.NORMAL_CLOSURE, "done");
        }
    }
}
