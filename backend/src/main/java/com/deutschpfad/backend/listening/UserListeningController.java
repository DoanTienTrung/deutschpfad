package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Lets a logged-in user maintain their own private list of YouTube videos (mirrors the
 * admin-curated ListeningExercise flow, but scoped to the owner instead of admin-only) — same
 * transcript parse/auto-fetch/AI-annotate pipeline as ListeningExerciseAdminController, reusing
 * TranscriptParser, YtDlpService, and GroqAiService as-is.
 */
@RestController
@RequestMapping("/api/user-listening-items")
public class UserListeningController {

    private final UserListeningItemRepository itemRepository;
    private final UserListeningSentenceRepository sentenceRepository;
    private final UserRepository userRepository;
    private final YtDlpService ytDlpService;
    private final GroqAiService aiService;
    private final YoutubeMetadataService youtubeMetadataService;
    private final DeepgramTranscriptionService transcriptionService;
    private final EspeakPhoneticService phoneticService;

    public UserListeningController(
        UserListeningItemRepository itemRepository,
        UserListeningSentenceRepository sentenceRepository,
        UserRepository userRepository,
        YtDlpService ytDlpService,
        GroqAiService aiService,
        YoutubeMetadataService youtubeMetadataService,
        DeepgramTranscriptionService transcriptionService,
        EspeakPhoneticService phoneticService
    ) {
        this.itemRepository = itemRepository;
        this.sentenceRepository = sentenceRepository;
        this.userRepository = userRepository;
        this.ytDlpService = ytDlpService;
        this.aiService = aiService;
        this.youtubeMetadataService = youtubeMetadataService;
        this.transcriptionService = transcriptionService;
        this.phoneticService = phoneticService;
    }

    public record VideoTitleResponse(String title) {}

    @GetMapping("/video-title")
    public VideoTitleResponse videoTitle(@RequestParam String videoId) {
        return new VideoTitleResponse(youtubeMetadataService.fetchTitle(videoId));
    }

    @GetMapping
    public List<UserListeningItemSummaryResponse> list(Authentication authentication) {
        User user = currentUser(authentication);
        return itemRepository.findByUserOrderByCreatedAtDesc(user).stream()
            .map(item -> UserListeningItemSummaryResponse.from(
                item, sentenceRepository.findByItemIdOrderByOrderIndex(item.getId()).size()
            ))
            .toList();
    }

    @GetMapping("/{id}")
    public UserListeningItemDetailResponse get(@PathVariable Long id, Authentication authentication) {
        UserListeningItem item = getOwnedItem(id, currentUser(authentication));
        List<UserListeningSentence> sentences = sentenceRepository.findByItemIdOrderByOrderIndex(id);
        return UserListeningItemDetailResponse.from(item, sentences, false);
    }

    @PostMapping
    public ResponseEntity<UserListeningItemDetailResponse> create(
        @Valid @RequestBody UserListeningItemRequest request, Authentication authentication
    ) {
        UserListeningItem item = new UserListeningItem();
        item.setUser(currentUser(authentication));
        applyRequest(item, request);
        item = itemRepository.save(item);
        boolean autoFetch = request.autoFetch() || (request.rawTranscript() == null || request.rawTranscript().isBlank());
        return ResponseEntity.ok(applyTranscript(item, request.rawTranscript(), autoFetch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserListeningItemDetailResponse> update(
        @PathVariable Long id, @Valid @RequestBody UserListeningItemRequest request, Authentication authentication
    ) {
        UserListeningItem item = getOwnedItem(id, currentUser(authentication));
        applyRequest(item, request);
        item = itemRepository.save(item);
        return ResponseEntity.ok(applyTranscript(item, request.rawTranscript(), request.autoFetch()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        UserListeningItem item = getOwnedItem(id, currentUser(authentication));
        sentenceRepository.deleteByItemId(item.getId());
        itemRepository.delete(item);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/sentences/{sentenceId}/shadowing-feedback", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ShadowingFeedbackResponse gradeShadowing(
        @PathVariable Long sentenceId, @RequestParam("audio") MultipartFile audio, Authentication authentication
    ) throws IOException {
        UserListeningSentence sentence = getOwnedSentence(sentenceId, currentUser(authentication));

        String transcript = transcriptionService.transcribe(audio.getBytes(), audio.getContentType());
        if (transcript == null) return ShadowingFeedbackResponse.unavailable();

        return ShadowingFeedbackResponse.from(transcript, PronunciationScorer.score(sentence.getText(), transcript));
    }

    @GetMapping("/sentences/{sentenceId}/word-translation")
    public WordTranslationResponse translateWord(
        @PathVariable Long sentenceId, @RequestParam String word, Authentication authentication
    ) {
        UserListeningSentence sentence = getOwnedSentence(sentenceId, currentUser(authentication));

        String translation = aiService.translateWord(word, sentence.getText());
        return new WordTranslationResponse(word, translation, translation != null);
    }

    private UserListeningSentence getOwnedSentence(Long sentenceId, User user) {
        UserListeningSentence sentence = sentenceRepository.findById(sentenceId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu"));
        if (!sentence.getItem().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập câu này");
        }
        return sentence;
    }

    private UserListeningItemDetailResponse applyTranscript(
        UserListeningItem item, String rawTranscript, boolean autoFetchIfBlank
    ) {
        boolean hasRawTranscript = rawTranscript != null && !rawTranscript.isBlank();
        if (!hasRawTranscript && !autoFetchIfBlank) {
            List<UserListeningSentence> existing = sentenceRepository.findByItemIdOrderByOrderIndex(item.getId());
            return UserListeningItemDetailResponse.from(item, existing, false);
        }

        boolean autoFetched = false;
        List<TranscriptParser.SentenceData> parsed;
        if (hasRawTranscript) {
            parsed = TranscriptParser.parse(rawTranscript);
        } else {
            parsed = ytDlpService.fetchAutoTranscript(item.getYoutubeVideoId());
            autoFetched = !parsed.isEmpty();
        }

        sentenceRepository.deleteByItemId(item.getId());
        List<GroqAiService.SentenceAnnotation> annotations = aiService.annotateSentences(
            parsed.stream().map(TranscriptParser.SentenceData::text).toList()
        );
        List<UserListeningSentence> saved = new ArrayList<>();
        for (int i = 0; i < parsed.size(); i++) {
            TranscriptParser.SentenceData data = parsed.get(i);
            UserListeningSentence sentence = new UserListeningSentence();
            sentence.setItem(item);
            sentence.setOrderIndex(i);
            sentence.setText(data.text());
            sentence.setStartSeconds(data.startSeconds());
            sentence.setEndSeconds(data.endSeconds());
            sentence.setTranslation(annotations.get(i).translation());
            String phonetic = phoneticService.phonetic(data.text());
            sentence.setPhonetic(phonetic != null ? phonetic : annotations.get(i).phonetic());
            saved.add(sentenceRepository.save(sentence));
        }

        return UserListeningItemDetailResponse.from(item, saved, autoFetched);
    }

    private void applyRequest(UserListeningItem item, UserListeningItemRequest request) {
        boolean videoChanged = !request.youtubeVideoId().equals(item.getYoutubeVideoId());
        item.setTitle(request.title());
        item.setYoutubeVideoId(request.youtubeVideoId());
        item.setDescription(request.description());
        if (videoChanged || item.getDurationSeconds() == null) {
            item.setDurationSeconds(ytDlpService.fetchDurationSeconds(request.youtubeVideoId()));
        }
    }

    private UserListeningItem getOwnedItem(Long id, User user) {
        UserListeningItem item = itemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy video"));
        if (!item.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập video này");
        }
        return item;
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
