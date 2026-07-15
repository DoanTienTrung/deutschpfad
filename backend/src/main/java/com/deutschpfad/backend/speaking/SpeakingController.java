package com.deutschpfad.backend.speaking;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.listening.DeepgramTranscriptionService;
import com.deutschpfad.backend.listening.GroqAiService;
import com.deutschpfad.backend.vocabulary.VocabularyItem;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/speaking")
public class SpeakingController {

    private final SpeakingPromptRepository promptRepository;
    private final UserRecordingRepository recordingRepository;
    private final ConversationTurnRepository turnRepository;
    private final UserRepository userRepository;
    private final DeepgramTranscriptionService transcriptionService;
    private final GroqAiService aiService;

    public SpeakingController(
        SpeakingPromptRepository promptRepository,
        UserRecordingRepository recordingRepository,
        ConversationTurnRepository turnRepository,
        UserRepository userRepository,
        DeepgramTranscriptionService transcriptionService,
        GroqAiService aiService
    ) {
        this.promptRepository = promptRepository;
        this.recordingRepository = recordingRepository;
        this.turnRepository = turnRepository;
        this.userRepository = userRepository;
        this.transcriptionService = transcriptionService;
        this.aiService = aiService;
    }

    @GetMapping
    public List<SpeakingPromptResponse> list(@RequestParam VocabularyItem.Level level) {
        return promptRepository.findByLevelOrderByOrderIndex(level).stream()
            .map(SpeakingPromptResponse::from)
            .toList();
    }

    @GetMapping("/{id}")
    public SpeakingPromptResponse get(@PathVariable Long id) {
        return SpeakingPromptResponse.from(findPromptOrThrow(id));
    }

    @GetMapping("/{id}/history")
    public List<RecordingHistoryResponse> history(@PathVariable Long id, Authentication authentication) {
        User user = currentUser(authentication);
        return recordingRepository.findByUserAndPromptIdOrderByCreatedAtDesc(user, id).stream()
            .map(recording -> RecordingHistoryResponse.from(
                recording, turnRepository.findByRecordingIdOrderByTurnIndex(recording.getId())
            ))
            .toList();
    }

    @GetMapping("/turns/{turnId}/audio")
    public ResponseEntity<byte[]> turnAudio(@PathVariable Long turnId, Authentication authentication) {
        User user = currentUser(authentication);
        ConversationTurn turn = turnRepository.findById(turnId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lượt nói"));

        if (!turn.getRecording().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Không tìm thấy lượt nói");
        }
        if (turn.getAudioData() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, "audio/wav")
            .body(turn.getAudioData());
    }

    @PostMapping(value = "/{id}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SpeakingSubmissionResponse submit(
        @PathVariable Long id, @RequestParam("audio") MultipartFile audio, Authentication authentication
    ) throws IOException {
        SpeakingPrompt prompt = findPromptOrThrow(id);
        User user = currentUser(authentication);

        DeepgramTranscriptionService.TranscriptionResult transcription =
            transcriptionService.transcribeWithConfidence(audio.getBytes(), audio.getContentType());
        if (transcription == null) return SpeakingSubmissionResponse.unavailable();

        String feedback = aiService.gradeSpeakingAnswer(prompt.getPromptText(), transcription.transcript());

        UserRecording recording = new UserRecording();
        recording.setUser(user);
        recording.setPrompt(prompt);
        recording.setTranscript(transcription.transcript());
        recording.setFeedback(feedback);
        recording.setLowConfidenceWords(
            transcription.words().stream()
                .filter(w -> w.confidence() < 0.6)
                .map(DeepgramTranscriptionService.WordConfidence::word)
                .collect(Collectors.joining(", "))
        );
        recordingRepository.save(recording);

        return new SpeakingSubmissionResponse(true, transcription.transcript(), transcription.words(), feedback);
    }

    private SpeakingPrompt findPromptOrThrow(Long id) {
        return promptRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề bài"));
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
