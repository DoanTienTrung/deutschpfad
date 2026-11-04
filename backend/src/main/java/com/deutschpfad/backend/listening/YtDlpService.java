package com.deutschpfad.backend.listening;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/**
 * Fetches an existing YouTube caption track for a video via the {@code yt-dlp} CLI, using
 * {@code --skip-download} so only the subtitle file is retrieved — the video/audio stream is
 * never downloaded. Returns an empty list (never throws) when the video has no captions or the
 * tool is unavailable/times out, so callers can fall back to a manually pasted transcript.
 */
@Service
public class YtDlpService {

    private static final Logger log = LoggerFactory.getLogger(YtDlpService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(30);

    // Không còn tham số PO token (bgutil) hay cookie phiên Google: chúng chỉ để lách chặn bot của YouTube
    // trên IP datacenter (EC2/Oracle). Nay việc nhập video chạy từ máy nhà (docker-compose.neon.yml), IP
    // nhà không bị chặn nên yt-dlp chạy trơn. Cần lại thì lấy từ lịch sử git (commit f9ea675).

    public List<TranscriptParser.SentenceData> fetchAutoTranscript(String videoId) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("listening-sub-");
            String url = "https://www.youtube.com/watch?v=" + videoId;
            String outputTemplate = tempDir.resolve("sub").toString() + ".%(ext)s";

            List<String> command = new ArrayList<>(List.of(
                "yt-dlp",
                "--skip-download",
                // Some videos only expose image formats to yt-dlp once real cookies are used
                // (YouTube's SABR streaming restrictions on certain clients) — yt-dlp normally
                // treats "no downloadable formats" as fatal even with --skip-download, before
                // it gets to write the subtitle. This flag makes that non-fatal, since we never
                // wanted the video/audio format in the first place.
                "--ignore-no-formats-error",
                "--write-auto-sub", "--write-sub",
                // Some channels tag their German track "de-DE" instead of plain "de" (yt-dlp
                // matches language codes exactly, not by prefix) -- requesting both catches
                // either case. Một số kênh (vd MrWissen2go) đặt phụ đề gõ tay dưới mã có tên riêng
                // như "de-XwLwiJMB_Xs": mẫu thứ ba bắt các mã đó nhưng không bắt "de-orig" (bản tự động).
                // Mẫu không được chứa dấu phẩy (vd "{6,}"): yt-dlp tách danh sách ngôn ngữ theo dấu phẩy.
                "--sub-lang", "de,de-DE,de-[A-Za-z0-9_]{6}.*",
                "--sub-format", "vtt",
                "-o", outputTemplate
            ));
            command.add(url);

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            boolean finished = process.waitFor(TIMEOUT.toSeconds(), TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("yt-dlp timed out fetching captions for video {}", videoId);
                return List.of();
            }

            try (Stream<Path> files = Files.list(tempDir)) {
                // Có thể tải về nhiều file (de, de-DE, de-<tên>): ưu tiên "de" rồi "de-DE" cho ổn định.
                Optional<Path> vttFile = files.filter(p -> p.toString().endsWith(".vtt"))
                    .min(Comparator.comparingInt(YtDlpService::subtitlePriority).thenComparing(Path::toString));
                if (vttFile.isEmpty()) {
                    log.info("No captions found via yt-dlp for video {}", videoId);
                    return List.of();
                }
                String content = Files.readString(vttFile.get());
                return TranscriptParser.parse(content);
            }
        } catch (IOException e) {
            log.warn("yt-dlp unavailable or failed for video {}: {}", videoId, e.getMessage());
            return List.of();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return List.of();
        } finally {
            if (tempDir != null) deleteQuietly(tempDir);
        }
    }

    static int subtitlePriority(Path file) {
        String name = file.getFileName().toString();
        if (name.endsWith(".de.vtt")) return 0;
        if (name.endsWith(".de-DE.vtt")) return 1;
        return 2;
    }

    /** Reads only the duration metadata (seconds) via yt-dlp, never downloading the video. */
    public Integer fetchDurationSeconds(String videoId) {
        try {
            String url = "https://www.youtube.com/watch?v=" + videoId;
            List<String> command = new ArrayList<>(List.of(
                "yt-dlp", "--skip-download", "--ignore-no-formats-error", "--print", "duration"
            ));
            command.add(url);

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output;
            try (var in = process.getInputStream()) {
                output = new String(in.readAllBytes()).trim();
            }

            boolean finished = process.waitFor(TIMEOUT.toSeconds(), TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("yt-dlp timed out fetching duration for video {}", videoId);
                return null;
            }

            for (String line : output.lines().toList()) {
                try {
                    return (int) Double.parseDouble(line.trim());
                } catch (NumberFormatException ignored) {
                    // yt-dlp may print warnings before the duration line — skip non-numeric lines
                }
            }
            return null;
        } catch (IOException e) {
            log.warn("yt-dlp unavailable or failed to fetch duration for video {}: {}", videoId, e.getMessage());
            return null;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }

    public record PlaylistEntry(String videoId, Integer durationSeconds, String title) {}

    public record VideoMeta(String channelId, String channelName, String handle, Integer durationSeconds, String title) {}

    private static final Duration PLAYLIST_TIMEOUT = Duration.ofSeconds(120);
    private static final Pattern VIDEO_ID = Pattern.compile("[A-Za-z0-9_-]{11}");

    /**
     * Liệt kê video của một playlist / kênh / video lẻ (chỉ đọc danh sách, {@code --flat-playlist}: không
     * mở từng video, không tải gì). Trả danh sách rỗng nếu yt-dlp lỗi.
     */
    public List<PlaylistEntry> listPlaylist(String url, int limit) {
        List<String> command = new ArrayList<>(List.of(
            "yt-dlp", "--flat-playlist", "--playlist-end", String.valueOf(limit),
            "--print", "%(id)s\t%(duration)s\t%(title)s"
        ));
        command.add(url);
        String output = runForOutput(command, PLAYLIST_TIMEOUT, "listing " + url);
        return output == null ? List.of() : parsePlaylistLines(output);
    }

    /** Một dòng "id TAB thời lượng TAB tiêu đề" mỗi video; bỏ qua dòng cảnh báo yt-dlp in xen vào. */
    static List<PlaylistEntry> parsePlaylistLines(String output) {
        List<PlaylistEntry> entries = new ArrayList<>();
        for (String line : output.lines().toList()) {
            String[] parts = line.split("\t", 3);
            if (parts.length < 3 || !VIDEO_ID.matcher(parts[0].trim()).matches()) continue;
            entries.add(new PlaylistEntry(parts[0].trim(), parseSeconds(parts[1]), parts[2].strip()));
        }
        return entries;
    }

    /** Kênh + thời lượng + tiêu đề của một video trong một lần gọi; null nếu không đọc được. */
    public VideoMeta fetchVideoMeta(String videoId) {
        List<String> command = new ArrayList<>(List.of(
            "yt-dlp", "--skip-download", "--ignore-no-formats-error",
            "--print", "%(channel_id)s\t%(channel)s\t%(uploader_id)s\t%(duration)s\t%(title)s"
        ));
        command.add("https://www.youtube.com/watch?v=" + videoId);
        String output = runForOutput(command, TIMEOUT, "metadata of " + videoId);
        return output == null ? null : parseVideoMeta(output);
    }

    static VideoMeta parseVideoMeta(String output) {
        for (String line : output.lines().toList()) {
            String[] parts = line.split("\t", 5);
            if (parts.length < 5 || !parts[0].startsWith("UC")) continue;
            return new VideoMeta(parts[0].trim(), blankToNull(parts[1]), blankToNull(parts[2]),
                parseSeconds(parts[3]), blankToNull(parts[4]));
        }
        return null;
    }

    private static Integer parseSeconds(String value) {
        try {
            return (int) Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            return null; // "NA" khi YouTube không báo thời lượng (vd video đang phát trực tiếp)
        }
    }

    private static String blankToNull(String value) {
        String v = value == null ? "" : value.strip();
        return v.isEmpty() || v.equals("NA") ? null : v;
    }

    private String runForOutput(List<String> command, Duration timeout, String what) {
        try {
            Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
            // Đọc ở luồng riêng: playlist dài in nhiều dòng, đọc sau waitFor có thể kẹt vì đầy bộ đệm.
            CompletableFuture<String> output = CompletableFuture.supplyAsync(() -> {
                try (var in = process.getInputStream()) {
                    return new String(in.readAllBytes(), StandardCharsets.UTF_8);
                } catch (IOException e) {
                    return "";
                }
            });
            if (!process.waitFor(timeout.toSeconds(), TimeUnit.SECONDS)) {
                process.destroyForcibly();
                log.warn("yt-dlp timed out {}", what);
                return null;
            }
            return output.get(5, TimeUnit.SECONDS);
        } catch (IOException | ExecutionException | TimeoutException e) {
            log.warn("yt-dlp unavailable or failed {}: {}", what, e.getMessage());
            return null;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }

    private void deleteQuietly(Path dir) {
        try (Stream<Path> paths = Files.walk(dir)) {
            paths.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                }
            });
        } catch (IOException ignored) {
        }
    }
}
