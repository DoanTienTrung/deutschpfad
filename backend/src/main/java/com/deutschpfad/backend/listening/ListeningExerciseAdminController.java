package com.deutschpfad.backend.listening;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/listening-exercises")
@PreAuthorize("hasRole('ADMIN')")
public class ListeningExerciseAdminController {

    private final ListeningExerciseRepository exerciseRepository;
    private final ListeningSentenceRepository sentenceRepository;
    private final YtDlpService ytDlpService;
    private final GroqAiService translationService;

    public ListeningExerciseAdminController(
        ListeningExerciseRepository exerciseRepository,
        ListeningSentenceRepository sentenceRepository,
        YtDlpService ytDlpService,
        GroqAiService translationService
    ) {
        this.exerciseRepository = exerciseRepository;
        this.sentenceRepository = sentenceRepository;
        this.ytDlpService = ytDlpService;
        this.translationService = translationService;
    }

    @GetMapping
    public List<ListeningExerciseAdminResponse> list() {
        return exerciseRepository.findAll().stream()
            .map(exercise -> {
                List<ListeningSentence> sentences = sentenceRepository.findByExerciseIdOrderByOrderIndex(exercise.getId());
                return ListeningExerciseAdminResponse.from(exercise, sentences, false);
            })
            .toList();
    }

    @GetMapping("/{id}")
    public ListeningExerciseAdminResponse get(@PathVariable Long id) {
        ListeningExercise exercise = findOrThrow(id);
        List<ListeningSentence> sentences = sentenceRepository.findByExerciseIdOrderByOrderIndex(id);
        return ListeningExerciseAdminResponse.from(exercise, sentences, false);
    }

    @PostMapping
    public ResponseEntity<ListeningExerciseAdminResponse> create(@Valid @RequestBody ListeningExerciseRequest request) {
        ListeningExercise exercise = new ListeningExercise();
        applyRequest(exercise, request);
        exercise = exerciseRepository.save(exercise);
        // Create: default to trying auto-fetch even if the client didn't explicitly ask, since
        // there is nothing to lose yet (no existing sentences to overwrite).
        boolean autoFetch = request.autoFetch() || (request.rawTranscript() == null || request.rawTranscript().isBlank());
        return ResponseEntity.ok(applyTranscript(exercise, request.rawTranscript(), autoFetch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListeningExerciseAdminResponse> update(
        @PathVariable Long id, @Valid @RequestBody ListeningExerciseRequest request
    ) {
        ListeningExercise exercise = findOrThrow(id);
        applyRequest(exercise, request);
        exercise = exerciseRepository.save(exercise);
        // Update: only touch existing sentences if the admin pasted a fresh transcript OR
        // explicitly asked to retry auto-fetch (autoFetch=true) — a blank transcript with
        // autoFetch=false leaves whatever sentences already exist untouched.
        return ResponseEntity.ok(applyTranscript(exercise, request.rawTranscript(), request.autoFetch()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sentenceRepository.deleteByExerciseId(id);
        exerciseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ListeningExerciseAdminResponse applyTranscript(
        ListeningExercise exercise, String rawTranscript, boolean autoFetchIfBlank
    ) {
        boolean hasRawTranscript = rawTranscript != null && !rawTranscript.isBlank();
        if (!hasRawTranscript && !autoFetchIfBlank) {
            // Leave existing sentences untouched.
            List<ListeningSentence> existing = sentenceRepository.findByExerciseIdOrderByOrderIndex(exercise.getId());
            return ListeningExerciseAdminResponse.from(exercise, existing, false);
        }

        boolean autoFetched = false;
        List<TranscriptParser.SentenceData> parsed;
        if (hasRawTranscript) {
            parsed = TranscriptParser.parse(rawTranscript);
        } else {
            parsed = ytDlpService.fetchAutoTranscript(exercise.getYoutubeVideoId());
            autoFetched = !parsed.isEmpty();
        }

        sentenceRepository.deleteByExerciseId(exercise.getId());
        List<GroqAiService.SentenceAnnotation> annotations = translationService.annotateSentences(
            parsed.stream().map(TranscriptParser.SentenceData::text).toList()
        );
        List<ListeningSentence> saved = new ArrayList<>();
        for (int i = 0; i < parsed.size(); i++) {
            TranscriptParser.SentenceData data = parsed.get(i);
            ListeningSentence sentence = new ListeningSentence();
            sentence.setExercise(exercise);
            sentence.setOrderIndex(i);
            sentence.setText(data.text());
            sentence.setStartSeconds(data.startSeconds());
            sentence.setEndSeconds(data.endSeconds());
            sentence.setTranslation(annotations.get(i).translation());
            sentence.setPhonetic(annotations.get(i).phonetic());
            saved.add(sentenceRepository.save(sentence));
        }

        return ListeningExerciseAdminResponse.from(exercise, saved, autoFetched);
    }

    private void applyRequest(ListeningExercise exercise, ListeningExerciseRequest request) {
        boolean videoChanged = !request.youtubeVideoId().equals(exercise.getYoutubeVideoId());
        exercise.setTitle(request.title());
        exercise.setLevelMin(request.levelMin());
        exercise.setLevelMax(request.levelMax());
        exercise.setYoutubeVideoId(request.youtubeVideoId());
        exercise.setDescription(request.description());
        exercise.setTopic(request.topic() != null && !request.topic().isBlank() ? request.topic().trim() : null);
        exercise.setOrderIndex(request.orderIndex());
        if (videoChanged || exercise.getDurationSeconds() == null) {
            exercise.setDurationSeconds(ytDlpService.fetchDurationSeconds(request.youtubeVideoId()));
        }
    }

    private ListeningExercise findOrThrow(Long id) {
        return exerciseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài nghe"));
    }
}
