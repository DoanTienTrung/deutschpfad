package com.deutschpfad.backend.listening;

import com.deutschpfad.backend.common.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Real Google session cookies (see YtDlpService) are what let yt-dlp pass YouTube's bot check
 * on the EC2 IP — a PO token alone stopped being enough in 2026. Those cookies expire and there
 * is no safe way to auto-refresh them unattended (that would mean storing a Google password on
 * the server). This job is the next best thing: it notices the moment they go stale and emails
 * an alert, instead of the failure sitting silent until someone happens to notice a blank
 * transcript in the Admin UI, as happened before this was added.
 */
@Service
public class YtDlpHealthCheckService {

    private static final Logger log = LoggerFactory.getLogger(YtDlpHealthCheckService.class);

    // "25 Minutes of Daily German Dialogues at the Cafe" — already used as real content
    // (listening_exercises id=11), long-published and stable, known-good German captions.
    private static final String TEST_VIDEO_ID = "NrE8qO0p6J8";

    private final YtDlpService ytDlpService;
    private final EmailService emailService;
    private final String cookiesFile;
    private final String alertEmail;

    public YtDlpHealthCheckService(
        YtDlpService ytDlpService,
        EmailService emailService,
        @Value("${app.ytdlp-cookies-file:}") String cookiesFile,
        @Value("${app.ytdlp-healthcheck-alert-email:}") String alertEmail
    ) {
        this.ytDlpService = ytDlpService;
        this.emailService = emailService;
        this.cookiesFile = cookiesFile;
        this.alertEmail = alertEmail;
    }

    @Scheduled(cron = "0 0 7 * * *")
    public void checkCookiesStillWork() {
        if (cookiesFile == null || cookiesFile.isBlank()) {
            return; // nothing to monitor — no cookies configured (e.g. local dev)
        }

        List<TranscriptParser.SentenceData> result = ytDlpService.fetchAutoTranscript(TEST_VIDEO_ID);
        if (!result.isEmpty()) {
            log.info("yt-dlp health check OK ({} sentences fetched for test video)", result.size());
            return;
        }

        log.warn("yt-dlp health check FAILED — cookies file may have expired, see {}", cookiesFile);
        if (alertEmail != null && !alertEmail.isBlank()) {
            emailService.send(
                alertEmail,
                "[DeutschPfad] Cookie YouTube cho yt-dlp có thể đã hết hạn",
                "Job kiểm tra định kỳ vừa thử lấy phụ đề tiếng Đức cho 1 video test\n"
                    + "(https://www.youtube.com/watch?v=" + TEST_VIDEO_ID + ") qua yt-dlp và không lấy được câu nào.\n\n"
                    + "Đây thường có nghĩa là cookie YouTube đang dùng (file " + cookiesFile + " trên server)\n"
                    + "đã hết hạn — cần xuất lại cookie mới từ trình duyệt và thay vào server.\n\n"
                    + "Nếu đây chỉ là lỗi tạm thời (mạng, YouTube bảo trì...), có thể bỏ qua và đợi lần kiểm tra tiếp theo.\n\n"
                    + "— DeutschPfad (tự động)"
            );
        }
    }
}
