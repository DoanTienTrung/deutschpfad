package com.deutschpfad.backend.listening;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
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

    public List<TranscriptParser.SentenceData> fetchAutoTranscript(String videoId) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("listening-sub-");
            String url = "https://www.youtube.com/watch?v=" + videoId;
            String outputTemplate = tempDir.resolve("sub").toString() + ".%(ext)s";

            ProcessBuilder pb = new ProcessBuilder(
                "yt-dlp",
                "--skip-download",
                "--write-auto-sub", "--write-sub",
                "--sub-lang", "de",
                "--sub-format", "vtt",
                "-o", outputTemplate,
                url
            );
            pb.redirectErrorStream(true);
            Process process = pb.start();
            boolean finished = process.waitFor(TIMEOUT.toSeconds(), TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("yt-dlp timed out fetching captions for video {}", videoId);
                return List.of();
            }

            try (Stream<Path> files = Files.list(tempDir)) {
                Optional<Path> vttFile = files.filter(p -> p.toString().endsWith(".vtt")).findFirst();
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

    /** Reads only the duration metadata (seconds) via yt-dlp, never downloading the video. */
    public Integer fetchDurationSeconds(String videoId) {
        try {
            String url = "https://www.youtube.com/watch?v=" + videoId;
            ProcessBuilder pb = new ProcessBuilder("yt-dlp", "--skip-download", "--print", "duration", url);
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
