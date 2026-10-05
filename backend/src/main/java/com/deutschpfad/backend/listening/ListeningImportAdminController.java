package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.vocabulary.VocabularyItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/** Nhập video YouTube hàng loạt cho phần nghe: danh sách đề xuất, nhập từ playlist/kênh, chạy job. */
@RestController
@RequestMapping("/api/admin/listening-import")
@PreAuthorize("hasRole('ADMIN')")
public class ListeningImportAdminController {

    /** Chỉ nhận link YouTube: link được truyền thẳng cho yt-dlp, chuỗi bắt đầu bằng "-" sẽ thành tham số. */
    private static final Pattern YOUTUBE_URL = Pattern.compile("^https://(www\\.|m\\.)?(youtube\\.com|youtu\\.be)/\\S+$");
    private static final int MAX_PREVIEW = 100;

    private final ListeningImportService importService;
    private final ListeningImportJob importJob;
    private final ListeningChannelRepository channelRepository;
    private final ListeningExerciseRepository exerciseRepository;
    private final YtDlpService ytDlpService;

    public ListeningImportAdminController(
        ListeningImportService importService,
        ListeningImportJob importJob,
        ListeningChannelRepository channelRepository,
        ListeningExerciseRepository exerciseRepository,
        YtDlpService ytDlpService
    ) {
        this.importService = importService;
        this.importJob = importJob;
        this.channelRepository = channelRepository;
        this.exerciseRepository = exerciseRepository;
        this.ytDlpService = ytDlpService;
    }

    public record ChannelResponse(Long id, String name, String handle, String youtubeChannelId, int orderIndex) {
        static ChannelResponse from(ListeningChannel c) {
            return new ChannelResponse(c.getId(), c.getName(), c.getHandle(), c.getYoutubeChannelId(), c.getOrderIndex());
        }
    }

    @GetMapping("/channels")
    public List<ChannelResponse> channels() {
        return channelRepository.findAllByOrderByOrderIndexAscNameAsc().stream().map(ChannelResponse::from).toList();
    }

    @GetMapping("/catalog")
    public List<ListeningImportService.CatalogVideoView> catalog() {
        return importService.catalogView();
    }

    @PostMapping("/catalog/apply")
    public Map<String, Integer> applyCatalog() {
        return Map.of("created", importService.applyCatalog());
    }

    public record PreviewRequest(@NotBlank String url, Integer limit) {}

    public record PreviewEntry(String videoId, String title, Integer durationSeconds, boolean exists) {}

    @PostMapping("/preview")
    public List<PreviewEntry> preview(@Valid @RequestBody PreviewRequest request) {
        String url = request.url().trim();
        if (!YOUTUBE_URL.matcher(url).matches()) {
            throw new IllegalArgumentException("Cần link YouTube dạng https://www.youtube.com/... hoặc https://youtu.be/...");
        }
        int limit = Math.max(1, Math.min(MAX_PREVIEW, request.limit() == null ? 50 : request.limit()));
        Set<String> existing = importService.existingVideoIds();
        return ytDlpService.listPlaylist(url, limit).stream()
            .map(e -> new PreviewEntry(e.videoId(), e.title(), e.durationSeconds(), existing.contains(e.videoId())))
            .toList();
    }

    public record EnqueueRequest(
        Long channelId,
        @NotNull VocabularyItem.Level levelMin,
        @NotNull VocabularyItem.Level levelMax,
        @NotEmpty List<ListeningImportService.NewVideo> videos
    ) {}

    @PostMapping
    public Map<String, Integer> enqueue(@Valid @RequestBody EnqueueRequest request) {
        ListeningChannel channel = request.channelId() == null ? null : channelRepository.findById(request.channelId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kênh"));
        return Map.of("created", importService.enqueue(request.videos(), channel, request.levelMin(), request.levelMax()));
    }

    @PostMapping("/run")
    public Map<String, Boolean> run() {
        return Map.of("started", importJob.start());
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return importJob.status();
    }

    /** Đưa bài FAILED về hàng chờ để job thử lại từ đầu. */
    @PostMapping("/{id}/retry")
    public ResponseEntity<Void> retry(@PathVariable Long id) {
        ListeningExercise exercise = exerciseRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài nghe"));
        if (exercise.getStatus() != ListeningExercise.Status.FAILED) {
            throw new IllegalArgumentException("Chỉ thử lại được bài đang ở trạng thái lỗi");
        }
        exercise.setStatus(ListeningExercise.Status.PENDING);
        exercise.setImportAttempts(0);
        exercise.setImportError(null);
        exerciseRepository.save(exercise);
        return ResponseEntity.noContent().build();
    }
}
