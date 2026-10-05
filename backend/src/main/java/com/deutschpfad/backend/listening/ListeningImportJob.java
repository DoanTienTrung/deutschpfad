package com.deutschpfad.backend.listening;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Nhập video YouTube hàng loạt cho phần nghe, chạy nền (admin bấm chạy, và tự chạy mỗi đêm).
 *
 * <p>Mỗi lượt có ba bước:
 * <ol>
 *   <li><b>Lấy phụ đề</b> cho bài PENDING (tối đa {@code max-videos-per-run}, nghỉ giữa các video để
 *       YouTube không chặn bot trên EC2): lưu câu + IPA, chưa dịch, chuyển TRANSLATING. Không lấy được phụ đề
 *       thì thử lại lượt sau, quá 3 lần mới FAILED; 3 video liền nhau không lấy được thì dừng bước này.</li>
 *   <li><b>Bổ sung kênh/thời lượng</b> cho video đã hiện mà còn thiếu (bài nhập tay trước khi có kênh).</li>
 *   <li><b>Dịch</b> câu còn thiếu, lô 40 câu, tối đa {@code max-sentences-per-run}. Bài dịch xong mới READY
 *       (người học mới thấy).</li>
 * </ol>
 *
 * <p>Dịch <b>chỉ dùng Groq</b> như {@link com.deutschpfad.backend.vocabulary.ExampleTranslationJob}: bản dịch
 * lưu vĩnh viễn, thà dịch tiếp ngày mai còn hơn lưu bản của model miễn phí bất kỳ. Lô nào Groq không dịch
 * được câu nào (thường là hết quota ngày) thì dừng cả lượt; lượt sau làm tiếp đúng chỗ còn thiếu.
 */
@Service
public class ListeningImportJob {

    private static final Logger log = LoggerFactory.getLogger(ListeningImportJob.class);
    static final int BATCH_SIZE = 40;
    static final int MAX_ATTEMPTS = 3;
    /** yt-dlp lỗi liền mấy video (không đọc được cả metadata) thì coi như đang bị YouTube chặn, dừng bước 1. */
    private static final int MAX_CONSECUTIVE_YTDLP_FAILURES = 3;
    private static final int MAX_METADATA_BACKFILL = 20;
    /** Phụ đề dài hơn mức này (phim dài, livestream) thì không nhập: tốn quota dịch, khó luyện từng câu. */
    static final int MAX_SENTENCES_PER_VIDEO = 800;

    private final ListeningExerciseRepository exerciseRepository;
    private final ListeningSentenceRepository sentenceRepository;
    private final ListeningSentenceWriter sentenceWriter;
    private final ListeningImportService importService;
    private final YtDlpService ytDlpService;
    private final GroqAiService aiService;
    private final int maxVideosPerRun;
    private final int maxSentencesPerRun;
    private final long videoDelayMs;
    private final long batchDelayMs;
    private final boolean nightlyEnabled;

    private volatile boolean running = false;
    private volatile String phase = null;
    private volatile String stopReason = null;
    private final AtomicInteger videosProcessed = new AtomicInteger(0);
    private final AtomicInteger videosFailed = new AtomicInteger(0);
    private final AtomicInteger sentencesTranslated = new AtomicInteger(0);
    private final AtomicInteger videosReady = new AtomicInteger(0);

    public ListeningImportJob(
        ListeningExerciseRepository exerciseRepository,
        ListeningSentenceRepository sentenceRepository,
        ListeningSentenceWriter sentenceWriter,
        ListeningImportService importService,
        YtDlpService ytDlpService,
        GroqAiService aiService,
        @Value("${app.listening.import.max-videos-per-run:30}") int maxVideosPerRun,
        @Value("${app.listening.import.max-sentences-per-run:1500}") int maxSentencesPerRun,
        @Value("${app.listening.import.video-delay-ms:10000}") long videoDelayMs,
        @Value("${app.listening.import.batch-delay-ms:8000}") long batchDelayMs,
        @Value("${app.listening.import.nightly-enabled:true}") boolean nightlyEnabled
    ) {
        this.exerciseRepository = exerciseRepository;
        this.sentenceRepository = sentenceRepository;
        this.sentenceWriter = sentenceWriter;
        this.importService = importService;
        this.ytDlpService = ytDlpService;
        this.aiService = aiService;
        this.maxVideosPerRun = maxVideosPerRun;
        this.maxSentencesPerRun = maxSentencesPerRun;
        this.videoDelayMs = videoDelayMs;
        this.batchDelayMs = batchDelayMs;
        this.nightlyEnabled = nightlyEnabled;
    }

    /** 02:00 giờ Việt Nam, lúc không ai dùng gia sư; giới hạn mỗi lượt vẫn áp dụng. */
    @Scheduled(cron = "0 0 2 * * *", zone = "Asia/Ho_Chi_Minh")
    public void nightly() {
        if (nightlyEnabled && hasWork()) start();
    }

    private boolean hasWork() {
        return exerciseRepository.countByStatus(ListeningExercise.Status.PENDING) > 0
            || exerciseRepository.countByStatus(ListeningExercise.Status.TRANSLATING) > 0
            || !exerciseRepository.findReadyYoutubeMissingMetadata().isEmpty();
    }

    /** @return false nếu đang có một lượt chạy */
    public synchronized boolean start() {
        if (running) return false;
        running = true;
        new Thread(this::runGuarded, "listening-import").start();
        return true;
    }

    /** Chạy một lượt ngay trên luồng hiện tại (test dùng); trả false nếu đang có lượt khác chạy. */
    boolean runNow() {
        synchronized (this) {
            if (running) return false;
            running = true;
        }
        runGuarded();
        return true;
    }

    public Map<String, Object> status() {
        Map<String, Object> status = new HashMap<>();
        status.put("running", running);
        status.put("phase", phase);
        status.put("stopReason", stopReason);
        status.put("videosProcessed", videosProcessed.get());
        status.put("videosFailed", videosFailed.get());
        status.put("videosReady", videosReady.get());
        status.put("sentencesTranslated", sentencesTranslated.get());
        status.put("sentencesRemaining", sentenceRepository.countUntranslatedOfTranslatingExercises());
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ListeningExercise.Status s : ListeningExercise.Status.values()) byStatus.put(s.name(), 0L);
        for (Object[] row : exerciseRepository.countYoutubeByStatus()) {
            byStatus.put(((ListeningExercise.Status) row[0]).name(), (Long) row[1]);
        }
        status.put("byStatus", byStatus);
        status.put("maxVideosPerRun", maxVideosPerRun);
        status.put("maxSentencesPerRun", maxSentencesPerRun);
        return status;
    }

    private void runGuarded() {
        stopReason = null;
        videosProcessed.set(0);
        videosFailed.set(0);
        sentencesTranslated.set(0);
        videosReady.set(0);
        try {
            fetchTranscripts();
            backfillMetadata();
            translate();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            stopReason = "Bị dừng giữa chừng.";
        } catch (Exception e) {
            stopReason = "Lỗi: " + Objects.toString(e.getMessage(), e.getClass().getSimpleName());
            log.warn("Listening import failed", e);
        } finally {
            phase = null;
            running = false;
        }
    }

    // ---------------------------------------------------------------- bước 1: phụ đề

    private void fetchTranscripts() throws InterruptedException {
        phase = "Lấy phụ đề";
        List<ListeningExercise> pending = exerciseRepository.findByStatusOrderByIdAsc(
            ListeningExercise.Status.PENDING, PageRequest.of(0, maxVideosPerRun));
        int consecutiveFailures = 0;
        for (int i = 0; i < pending.size(); i++) {
            if (i > 0) Thread.sleep(videoDelayMs);
            boolean ytDlpWorked = importOne(pending.get(i));
            consecutiveFailures = ytDlpWorked ? 0 : consecutiveFailures + 1;
            if (consecutiveFailures >= MAX_CONSECUTIVE_YTDLP_FAILURES) {
                stopReason = "Không lấy được phụ đề của " + MAX_CONSECUTIVE_YTDLP_FAILURES + " video liền nhau (có thể YouTube "
                    + "đang chặn bot, xem email kiểm tra yt-dlp). Đã dừng phần lấy phụ đề lượt này, phần dịch vẫn chạy.";
                log.warn("Listening import: {}", stopReason);
                return;
            }
        }
    }

    /** @return false nếu không lấy được phụ đề (có thể đang bị chặn), true nếu đã xử lý xong video này */
    private boolean importOne(ListeningExercise exercise) {
        String videoId = exercise.getYoutubeVideoId();
        YtDlpService.VideoMeta meta = ytDlpService.fetchVideoMeta(videoId);
        List<TranscriptParser.SentenceData> parsed = ytDlpService.fetchAutoTranscript(videoId);

        if (parsed.isEmpty()) {
            // Không có phụ đề chưa chắc là video không có phụ đề: khi YouTube chặn bot hoặc thiếu PO token,
            // yt-dlp vẫn đọc được tiêu đề/kênh nhưng phụ đề thì trống. Nên luôn thử lại ở lượt sau, quá 3 lần
            // mới FAILED (admin bấm "Thử lại" được), và tính vào chuỗi lỗi liền nhau để dừng sớm khi bị chặn.
            int attempts = exercise.getImportAttempts() + 1;
            exercise.setImportAttempts(attempts);
            if (attempts >= MAX_ATTEMPTS) {
                fail(exercise, meta != null
                    ? "Không lấy được phụ đề tiếng Đức sau " + attempts + " lần thử (video không có phụ đề, hoặc YouTube chặn)"
                    : "yt-dlp không đọc được video sau " + attempts + " lần thử (video bị xoá, riêng tư, hoặc bị chặn)");
            } else {
                applyMeta(exercise, meta);
                exercise.setImportError("Chưa lấy được phụ đề (lần " + attempts + "), sẽ thử lại lượt sau");
                exerciseRepository.save(exercise);
            }
            return false;
        }
        if (parsed.size() > MAX_SENTENCES_PER_VIDEO) {
            fail(exercise, "Video quá dài (" + parsed.size() + " câu, tối đa " + MAX_SENTENCES_PER_VIDEO + ")");
            return true;
        }
        if (TranscriptParser.lacksPunctuation(parsed)) {
            fail(exercise, "Phụ đề gần như không có dấu câu (phụ đề tự động đời cũ), không chia câu để luyện được");
            return true;
        }

        applyMeta(exercise, meta);
        sentenceWriter.replaceSentences(exercise, parsed, null);
        exercise.setStatus(ListeningExercise.Status.TRANSLATING);
        exercise.setImportError(null);
        exerciseRepository.save(exercise);
        videosProcessed.incrementAndGet();
        log.info("Listening import: {} sentences from {} ({})", parsed.size(), videoId, exercise.getTitle());
        return true;
    }

    private void fail(ListeningExercise exercise, String reason) {
        exercise.setStatus(ListeningExercise.Status.FAILED);
        exercise.setImportError(reason);
        exerciseRepository.save(exercise);
        videosFailed.incrementAndGet();
        log.info("Listening import: {} failed: {}", exercise.getYoutubeVideoId(), reason);
    }

    private void applyMeta(ListeningExercise exercise, YtDlpService.VideoMeta meta) {
        if (meta == null) return;
        if (exercise.getChannel() == null && meta.channelId() != null) {
            exercise.setChannel(importService.ensureChannel(meta.channelId(), meta.channelName(), meta.handle()));
        }
        if (exercise.getSourceLabel() == null && exercise.getChannel() != null) {
            exercise.setSourceLabel(exercise.getChannel().getName());
        }
        if (meta.durationSeconds() != null && meta.durationSeconds() > 0) {
            exercise.setDurationSeconds(meta.durationSeconds());
        }
    }

    // ---------------------------------------------------------------- bước 2: kênh/thời lượng bài cũ

    private void backfillMetadata() throws InterruptedException {
        phase = "Bổ sung kênh và thời lượng";
        List<ListeningExercise> missing = exerciseRepository.findReadyYoutubeMissingMetadata();
        for (int i = 0; i < Math.min(missing.size(), MAX_METADATA_BACKFILL); i++) {
            if (i > 0) Thread.sleep(Math.min(videoDelayMs, 3000));
            ListeningExercise exercise = missing.get(i);
            YtDlpService.VideoMeta meta = ytDlpService.fetchVideoMeta(exercise.getYoutubeVideoId());
            if (meta == null) continue;
            applyMeta(exercise, meta);
            exerciseRepository.save(exercise);
        }
    }

    // ---------------------------------------------------------------- bước 3: dịch

    private void translate() throws InterruptedException {
        phase = "Dịch";
        int budget = maxSentencesPerRun;
        long afterId = 0;
        // Câu đã thử 2 lần trong lượt này mà Groq vẫn không trả bản dịch (thường do model gộp dòng).
        Map<Long, Set<Long>> gaveUp = new HashMap<>();
        boolean first = true;

        while (budget > 0) {
            List<ListeningSentence> batch = sentenceRepository.findUntranslatedOfTranslatingExercisesAfter(
                afterId, PageRequest.of(0, Math.min(BATCH_SIZE, budget)));
            if (batch.isEmpty()) break;
            if (!first) Thread.sleep(batchDelayMs);
            first = false;
            afterId = batch.get(batch.size() - 1).getId();
            budget -= batch.size();

            List<String> texts = batch.stream().map(ListeningSentence::getText).toList();
            List<String> results = aiService.translateSentencesPlainPrimaryOnly(texts);
            if (allBlank(results)) {
                // Groq hay báo 503 "over capacity" vài phút: đợi một lúc thử lại lô này một lần rồi mới dừng.
                Thread.sleep(batchDelayMs * 8);
                results = aiService.translateSentencesPlainPrimaryOnly(texts);
            }
            if (allBlank(results)) {
                stopReason = "Groq không dịch được câu nào trong lô vừa rồi, kể cả khi thử lại sau một phút (hết quota ngày "
                    + "hoặc Groq đang quá tải), đã dừng. Lượt sau (02:00 hoặc bấm chạy lại) sẽ dịch tiếp phần còn thiếu.";
                log.warn("Listening import stopped: {}", stopReason);
                return;
            }

            List<ListeningSentence> missing = new ArrayList<>();
            for (int i = 0; i < batch.size(); i++) {
                if (!setTranslation(batch.get(i), results.get(i))) missing.add(batch.get(i));
            }
            if (!missing.isEmpty()) {
                List<String> retry = aiService.translateSentencesPlainPrimaryOnly(missing.stream().map(ListeningSentence::getText).toList());
                for (int i = 0; i < missing.size(); i++) {
                    if (!setTranslation(missing.get(i), retry.get(i))) {
                        gaveUp.computeIfAbsent(missing.get(i).getExercise().getId(), k -> new HashSet<>()).add(missing.get(i).getId());
                    }
                }
            }
            sentenceRepository.saveAll(batch);
            sentencesTranslated.addAndGet((int) batch.stream().filter(s -> s.getTranslation() != null).count());

            Set<Long> touched = new HashSet<>();
            batch.forEach(s -> touched.add(s.getExercise().getId()));
            for (Long exerciseId : touched) markReadyIfDone(exerciseId, gaveUp.getOrDefault(exerciseId, Set.of()));
        }

        if (budget <= 0 && sentenceRepository.countUntranslatedOfTranslatingExercises() > 0) {
            stopReason = "Đã dịch đủ " + maxSentencesPerRun + " câu của lượt này (giới hạn để chừa quota Groq cho gia sư "
                + "và các phần khác). Phần còn lại dịch ở lượt sau.";
        }
    }

    private static boolean allBlank(List<String> results) {
        return results.stream().allMatch(r -> r == null || r.isBlank());
    }

    private static boolean setTranslation(ListeningSentence sentence, String translation) {
        if (translation == null || translation.isBlank()) return false;
        sentence.setTranslation(translation.trim());
        return true;
    }

    /**
     * READY khi không còn câu nào chưa dịch, trừ vài câu Groq đã thử hai lần vẫn bỏ trống (tối đa 2% số câu,
     * ít nhất 2 câu): bỏ kẹt cả video vì một câu thì không đáng.
     */
    private void markReadyIfDone(Long exerciseId, Set<Long> gaveUpIds) {
        long untranslated = sentenceRepository.countUntranslated(exerciseId);
        if (untranslated > gaveUpIds.size()) return;
        ListeningExercise exercise = exerciseRepository.findById(exerciseId).orElse(null);
        if (exercise == null || exercise.getStatus() != ListeningExercise.Status.TRANSLATING) return;
        if (untranslated > 0) {
            long total = sentenceRepository.countByExerciseId(exerciseId);
            if (untranslated > Math.max(2, total / 50)) return;
            exercise.setImportError(untranslated + " câu chưa dịch được");
        }
        exercise.setStatus(ListeningExercise.Status.READY);
        exerciseRepository.save(exercise);
        videosReady.incrementAndGet();
        log.info("Listening import: exercise {} ready ({})", exerciseId, exercise.getTitle());
    }
}
