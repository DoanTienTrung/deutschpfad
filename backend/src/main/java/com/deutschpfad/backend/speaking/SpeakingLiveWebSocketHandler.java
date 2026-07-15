package com.deutschpfad.backend.speaking;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.listening.GroqAiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * One live Sprechen call = one browser WebSocket connection = one relayed connection to
 * Deepgram's Voice Agent API. Forwards audio both directions, buffers each turn's audio + text
 * in memory, and persists the whole conversation (transcript + audio + AI feedback) once the
 * browser disconnects.
 *
 * Turn boundaries are NOT based on "UserStartedSpeaking"/"AgentStartedSpeaking" events — despite
 * being documented, Deepgram never actually sends them in practice (confirmed by logging every
 * event type received across many live calls). Instead: every binary frame received from
 * Deepgram is agent audio (Deepgram never echoes the user's own audio back), accumulated into
 * one turn per utterance and closed on the reliably-observed "AgentAudioDone" event; the user's
 * turns are created directly from "ConversationText" events with role "user" (also reliably
 * observed), without a captured audio clip for now.
 */
@Component
public class SpeakingLiveWebSocketHandler implements WebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(SpeakingLiveWebSocketHandler.class);
    private static final int AGENT_SAMPLE_RATE = 24000;
    private static final int USER_SAMPLE_RATE = 16000;

    private final DeepgramVoiceAgentClient voiceAgentClient;
    private final GroqAiService groqAiService;
    private final UserRecordingRepository recordingRepository;
    private final ConversationTurnRepository turnRepository;
    private final String groqApiKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, CallSession> sessions = new ConcurrentHashMap<>();

    public SpeakingLiveWebSocketHandler(
        DeepgramVoiceAgentClient voiceAgentClient,
        GroqAiService groqAiService,
        UserRecordingRepository recordingRepository,
        ConversationTurnRepository turnRepository,
        @Value("${app.groq-api-key}") String groqApiKey
    ) {
        this.voiceAgentClient = voiceAgentClient;
        this.groqAiService = groqAiService;
        this.recordingRepository = recordingRepository;
        this.turnRepository = turnRepository;
        this.groqApiKey = groqApiKey;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession browserSession) {
        User user = (User) browserSession.getAttributes().get("user");
        SpeakingPrompt prompt = (SpeakingPrompt) browserSession.getAttributes().get("prompt");

        CallSession call = new CallSession(user, prompt);
        sessions.put(browserSession.getId(), call);

        String settingsJson = buildSettingsJson(prompt);

        voiceAgentClient.connect(settingsJson, new DeepgramVoiceAgentClient.Listener() {
            @Override
            public void onAudio(byte[] audio) {
                call.appendAgentAudio(audio);
                sendBinarySafely(browserSession, audio);
            }

            @Override
            public void onConversationText(String role, String content) {
                if (role != null && role.toLowerCase().contains("user")) {
                    call.addUserTurn(content);
                } else {
                    call.setPendingAgentText(content);
                }
            }

            @Override
            public void onUserStartedSpeaking() {
                // Observed to never fire in practice — kept as a no-op in case Deepgram adds it.
            }

            @Override
            public void onAgentStartedSpeaking() {
                // Observed to never fire in practice — kept as a no-op in case Deepgram adds it.
            }

            @Override
            public void onAgentAudioDone() {
                call.closeAgentTurn();
                sendEventSafely(browserSession, "agent_done");
            }

            @Override
            public void onError(String message) {
                log.warn("Voice agent error for session {}: {}", browserSession.getId(), message);
                sendEventSafely(browserSession, "error");
            }

            @Override
            public void onClose() {
                // Deepgram side closed; browser-side afterConnectionClosed drives persistence.
            }
        }).thenAccept(voiceSession -> {
            log.info("Deepgram Voice Agent connected for session {}", browserSession.getId());
            call.setVoiceSession(voiceSession);
        }).exceptionally(ex -> {
            log.warn("Failed to connect to Deepgram Voice Agent", ex);
            sendEventSafely(browserSession, "connect_failed");
            return null;
        });
    }

    @Override
    public void handleMessage(WebSocketSession browserSession, WebSocketMessage<?> message) {
        CallSession call = sessions.get(browserSession.getId());
        if (call == null || !(message instanceof BinaryMessage binaryMessage)) return;

        ByteBuffer payload = binaryMessage.getPayload();
        byte[] bytes = new byte[payload.remaining()];
        payload.get(bytes);

        call.appendUserAudio(bytes);
        if (call.getVoiceSession() != null) {
            call.getVoiceSession().sendAudio(bytes);
        } else {
            log.warn("Mic audio dropped for session {} — Deepgram voice session not ready yet", browserSession.getId());
        }
    }

    @Override
    public void handleTransportError(WebSocketSession browserSession, Throwable exception) {
        log.warn("WebSocket transport error for session {}", browserSession.getId(), exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession browserSession, CloseStatus closeStatus) {
        CallSession call = sessions.remove(browserSession.getId());
        if (call == null) return;

        if (call.getVoiceSession() != null) call.getVoiceSession().close();
        call.closeAgentTurn();
        dumpDebugAudio(call, browserSession.getId());
        persistCall(call);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    // TEMP DEBUG: dump the complete raw audio streams for a call (unsplit) so they can be
    // inspected directly with ffmpeg/ffprobe, independent of the turn-splitting logic above.
    private void dumpDebugAudio(CallSession call, String sessionId) {
        dumpDebugAudio(call.getFullAgentAudio(), AGENT_SAMPLE_RATE, "agent", sessionId);
        dumpDebugAudio(call.getFullUserAudio(), USER_SAMPLE_RATE, "user", sessionId);
    }

    private void dumpDebugAudio(byte[] raw, int sampleRate, String label, String sessionId) {
        if (raw.length == 0) return;
        try {
            byte[] wav = WavEncoder.wrapPcm16(raw, sampleRate, 1);
            Path path = Path.of("/tmp/debug-" + label + "-audio-" + sessionId + ".wav");
            Files.write(path, wav);
            log.info("Wrote debug {} audio: {} ({} bytes)", label, path, wav.length);
        } catch (Exception e) {
            log.warn("Failed to write debug {} audio", label, e);
        }
    }

    private void persistCall(CallSession call) {
        List<ConversationTurn> turns = call.getFinishedTurns();
        if (turns.isEmpty()) return;

        UserRecording recording = new UserRecording();
        recording.setUser(call.getUser());
        recording.setPrompt(call.getPrompt());

        List<GroqAiService.ConversationTurnText> turnTexts = turns.stream()
            .map(t -> new GroqAiService.ConversationTurnText(t.getRole().name(), t.getText()))
            .toList();
        recording.setFeedback(groqAiService.gradeConversation(call.getPrompt().getPromptText(), turnTexts));

        recording = recordingRepository.save(recording);
        for (ConversationTurn turn : turns) {
            turn.setRecording(recording);
            turnRepository.save(turn);
        }
    }

    private String buildSettingsJson(SpeakingPrompt prompt) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("type", "Settings");

        ObjectNode audio = root.putObject("audio");
        ObjectNode input = audio.putObject("input");
        input.put("encoding", "linear16");
        input.put("sample_rate", 16000);
        ObjectNode output = audio.putObject("output");
        output.put("encoding", "linear16");
        output.put("sample_rate", AGENT_SAMPLE_RATE);

        ObjectNode agent = root.putObject("agent");
        agent.put("language", "de");

        ObjectNode listen = agent.putObject("listen");
        ObjectNode listenProvider = listen.putObject("provider");
        listenProvider.put("type", "deepgram");
        listenProvider.put("model", "nova-3");

        // Deepgram's built-in "groq" think provider rejected our model name ("model not
        // available"), so route through their generic OpenAI-compatible custom-endpoint support
        // instead, pointed at Groq's own OpenAI-compatible API.
        ObjectNode think = agent.putObject("think");
        ObjectNode thinkProvider = think.putObject("provider");
        thinkProvider.put("type", "open_ai");
        thinkProvider.put("model", "llama-3.3-70b-versatile");
        ObjectNode endpoint = think.putObject("endpoint");
        endpoint.put("url", "https://api.groq.com/openai/v1/chat/completions");
        ObjectNode endpointHeaders = endpoint.putObject("headers");
        endpointHeaders.put("authorization", "Bearer " + groqApiKey);
        think.put("prompt", buildPersonaPrompt(prompt));

        ObjectNode speak = agent.putObject("speak");
        ObjectNode speakProvider = speak.putObject("provider");
        speakProvider.put("type", "deepgram");
        speakProvider.put("model", "aura-2-lara-de");

        agent.put("greeting", buildGreeting(prompt));

        return root.toString();
    }

    private String buildPersonaPrompt(SpeakingPrompt prompt) {
        return "Bạn đang đóng vai một thí sinh cùng thi nói tiếng Đức với người dùng, theo đúng "
            + "định dạng thi Sprechen của Goethe-Institut. Đề bài: \"" + prompt.getPromptText() + "\""
            + (prompt.getDescription() != null ? " (" + prompt.getDescription() + ")" : "")
            + ". Luôn nói bằng tiếng Đức, ở trình độ phù hợp với đề bài, tự nhiên như một thí sinh "
            + "thật — không phải giám khảo, không chấm điểm hay sửa lỗi giữa chừng, chỉ tương tác "
            + "đúng vai trò bạn cùng thi.";
    }

    private String buildGreeting(SpeakingPrompt prompt) {
        return "Hallo! Fangen wir an.";
    }

    private void sendBinarySafely(WebSocketSession session, byte[] data) {
        try {
            if (session.isOpen()) session.sendMessage(new BinaryMessage(ByteBuffer.wrap(data)));
        } catch (Exception e) {
            log.warn("Failed to forward audio to browser session {}", session.getId(), e);
        }
    }

    private void sendEventSafely(WebSocketSession session, String eventType) {
        try {
            if (session.isOpen()) {
                ObjectNode event = objectMapper.createObjectNode();
                event.put("type", eventType);
                session.sendMessage(new TextMessage(event.toString()));
            }
        } catch (Exception e) {
            log.warn("Failed to send event to browser session {}", session.getId(), e);
        }
    }

    /** Mutable per-call state accumulated while the WebSocket is open — not a JPA entity. */
    private static class CallSession {
        private final User user;
        private final SpeakingPrompt prompt;
        private DeepgramVoiceAgentClient.VoiceAgentSession voiceSession;

        private final List<ConversationTurn> finishedTurns = new ArrayList<>();
        private ByteArrayOutputStream currentAgentAudio = new ByteArrayOutputStream();
        private final ByteArrayOutputStream fullAgentAudio = new ByteArrayOutputStream();
        private ByteArrayOutputStream currentUserAudio = new ByteArrayOutputStream();
        private final ByteArrayOutputStream fullUserAudio = new ByteArrayOutputStream();
        private String pendingAgentText = "";

        CallSession(User user, SpeakingPrompt prompt) {
            this.user = user;
            this.prompt = prompt;
        }

        synchronized void appendAgentAudio(byte[] bytes) {
            currentAgentAudio.writeBytes(bytes);
            fullAgentAudio.writeBytes(bytes);
        }

        synchronized void setPendingAgentText(String content) {
            pendingAgentText = content;
        }

        synchronized void closeAgentTurn() {
            if (currentAgentAudio.size() == 0) return;
            byte[] wav = WavEncoder.wrapPcm16(currentAgentAudio.toByteArray(), AGENT_SAMPLE_RATE, 1);

            ConversationTurn turn = new ConversationTurn();
            turn.setRole(ConversationTurn.Role.AGENT);
            turn.setText(pendingAgentText.isBlank() ? "(không nghe rõ)" : pendingAgentText);
            turn.setAudioData(wav);
            turn.setTurnIndex(finishedTurns.size());
            finishedTurns.add(turn);

            currentAgentAudio = new ByteArrayOutputStream();
            pendingAgentText = "";
        }

        synchronized void appendUserAudio(byte[] bytes) {
            currentUserAudio.writeBytes(bytes);
            fullUserAudio.writeBytes(bytes);
        }

        synchronized void addUserTurn(String content) {
            if (content == null || content.isBlank()) return;
            byte[] wav = currentUserAudio.size() > 0
                ? WavEncoder.wrapPcm16(currentUserAudio.toByteArray(), USER_SAMPLE_RATE, 1)
                : null;

            ConversationTurn turn = new ConversationTurn();
            turn.setRole(ConversationTurn.Role.USER);
            turn.setText(content);
            turn.setAudioData(wav);
            turn.setTurnIndex(finishedTurns.size());
            finishedTurns.add(turn);

            currentUserAudio = new ByteArrayOutputStream();
        }

        synchronized byte[] getFullAgentAudio() {
            return fullAgentAudio.toByteArray();
        }

        synchronized byte[] getFullUserAudio() {
            return fullUserAudio.toByteArray();
        }

        User getUser() { return user; }
        SpeakingPrompt getPrompt() { return prompt; }
        DeepgramVoiceAgentClient.VoiceAgentSession getVoiceSession() { return voiceSession; }
        void setVoiceSession(DeepgramVoiceAgentClient.VoiceAgentSession voiceSession) { this.voiceSession = voiceSession; }
        List<ConversationTurn> getFinishedTurns() { return finishedTurns; }
    }
}
