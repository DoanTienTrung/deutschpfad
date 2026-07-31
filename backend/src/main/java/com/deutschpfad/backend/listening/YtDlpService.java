package com.deutschpfad.backend.listening;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
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

    private final String potBaseUrl;
    private final String cookiesFile;
    private final String browserProfileDir;

    public YtDlpService(
        @Value("${app.ytdlp-pot-base-url:}") String potBaseUrl,
        @Value("${app.ytdlp-cookies-file:}") String cookiesFile,
        @Value("${app.ytdlp-browser-profile-dir:}") String browserProfileDir
    ) {
        this.potBaseUrl = potBaseUrl;
        this.cookiesFile = cookiesFile;
        this.browserProfileDir = browserProfileDir;
    }

    /**
     * Datacenter IPs (e.g. our EC2 host) get blocked by YouTube's "Sign in to confirm you're
     * not a bot" check; a bgutil-ytdlp-pot-provider HTTP server (see docker-compose.prod.yml)
     * generates a proof-of-origin token that works around it. Omitted entirely when
     * app.ytdlp-pot-base-url is unset (local dev — home IPs aren't flagged).
     */
    private List<String> potExtractorArgs() {
        if (potBaseUrl == null || potBaseUrl.isBlank()) return List.of();
        return List.of("--extractor-args", "youtubepot-bgutilhttp:base_url=" + potBaseUrl);
    }

    /**
     * As of 2026 a PO token alone no longer satisfies YouTube's bot check for datacenter IPs —
     * real session cookies are required too. Two sources, tried in order:
     *
     * 1. A persistent Chromium profile kept logged in by the browser-session service (see
     *    docker-compose.prod.yml), read live via --cookies-from-browser. Preferred: its cookies
     *    rotate the same way a real browser's would, because that service actually is one.
     * 2. A static cookies.txt export, as a fallback. Proved too fragile as the primary
     *    mechanism on its own — Google rotates session cookies within hours of export, and a
     *    frozen file can't follow that — but harmless to keep as a second attempt.
     *
     * YtDlpHealthCheckService alerts by email when neither works.
     */
    private List<String> authArgs() {
        if (browserProfileDir != null && !browserProfileDir.isBlank() && Files.isDirectory(Path.of(browserProfileDir))) {
            return List.of("--cookies-from-browser", "chromium:" + browserProfileDir);
        }
        if (cookiesFile != null && !cookiesFile.isBlank() && Files.isReadable(Path.of(cookiesFile))) {
            return List.of("--cookies", cookiesFile);
        }
        return List.of();
    }

    /**
     * By default yt-dlp presents itself as an Android app client, a different identity than the
     * real browser that actually holds the session cookies passed in authArgs() above. Google
     * appears to treat that mismatch — the same cookies suddenly used by what looks like a
     * different device — as a compromised-session signal and invalidates them within minutes,
     * even though the real browser keeping the session alive is left untouched. Matching yt-dlp's
     * presented client to "web" keeps the identity consistent with the cookie source. Only
     * applied when real auth is actually in play — no reason to change local-dev behavior, which
     * already works fine with the default client on an unflagged home IP.
     */
    private List<String> playerClientArgs() {
        if (authArgs().isEmpty()) return List.of();
        return List.of("--extractor-args", "youtube:player_client=web");
    }

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
                // either case.
                "--sub-lang", "de,de-DE",
                "--sub-format", "vtt",
                "-o", outputTemplate
            ));
            command.addAll(potExtractorArgs());
            command.addAll(playerClientArgs());
            command.addAll(authArgs());
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
            List<String> command = new ArrayList<>(List.of(
                "yt-dlp", "--skip-download", "--ignore-no-formats-error", "--print", "duration"
            ));
            command.addAll(potExtractorArgs());
            command.addAll(playerClientArgs());
            command.addAll(authArgs());
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
