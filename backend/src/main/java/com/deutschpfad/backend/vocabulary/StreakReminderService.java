package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.common.EmailService;
import com.deutschpfad.backend.common.EmailTemplates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StreakReminderService {

    private static final Logger log = LoggerFactory.getLogger(StreakReminderService.class);
    private static final ZoneId REMINDER_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final UserRepository userRepository;
    private final LearningStreakRepository streakRepository;
    private final EmailService emailService;
    private final String frontendUrl;

    public StreakReminderService(
        UserRepository userRepository,
        LearningStreakRepository streakRepository,
        EmailService emailService,
        @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.userRepository = userRepository;
        this.streakRepository = streakRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Scheduled(cron = "0 0 7 * * *", zone = "Asia/Ho_Chi_Minh")
    public void sendMorningReminders() {
        sendReminders(
            "Dậy học từ vựng nào!",
            "Bạn chưa ôn từ vựng hôm nay. Dành vài phút ôn flashcard đầu ngày để giữ streak học tập nhé!"
        );
    }

    @Scheduled(cron = "0 0 22 * * *", zone = "Asia/Ho_Chi_Minh")
    public void sendEveningReminders() {
        sendReminders(
            "Học thêm chút từ vựng rồi ngủ nha",
            "Bạn chưa ôn từ vựng hôm nay. Ôn vài từ trước khi ngủ để giữ streak học tập nhé!"
        );
    }

    private void sendReminders(String subject, String message) {
        LocalDate today = LocalDate.now(REMINDER_ZONE);
        Map<Long, LearningStreak> streaksByUserId = streakRepository.findAll().stream()
            .collect(Collectors.toMap(s -> s.getUser().getId(), Function.identity()));

        List<User> verifiedUsers = userRepository.findAll().stream()
            .filter(User::isEmailVerified)
            .toList();

        int sentCount = 0;
        for (User user : verifiedUsers) {
            LearningStreak streak = streaksByUserId.get(user.getId());
            boolean studiedToday = streak != null && today.equals(streak.getLastActiveDate());
            if (!studiedToday) {
                // Thư nhắc học là thư dễ bị đánh dấu rác nhất trong cả hệ thống: gửi định kỳ cho
                // nhiều người, nội dung na ná nhau, lại không do người dùng bấm gì để kích hoạt.
                // Nên nó càng cần bố cục đàng hoàng và dòng giải thích vì sao nhận được thư.
                String practiceLink = frontendUrl + "/app/review";
                emailService.sendHtml(
                    user.getEmail(),
                    subject,
                    "Chào " + user.getFullName() + ",\n\n"
                        + message + "\n\n"
                        + "Vào ôn tại: " + practiceLink + "\n\n"
                        + "Bạn nhận được thư này vì đang có tài khoản DeutschPfad và hôm nay chưa"
                        + " ôn từ vựng.\n\n"
                        + "— DeutschPfad",
                    EmailTemplates.actionEmail(
                        user.getFullName(),
                        message,
                        "<p style=\"margin:0;\">" + message + "</p>",
                        "Vào ôn từ vựng",
                        practiceLink,
                        // TODO: chưa có tuỳ chọn tắt nhắc nhở nên KHÔNG hứa hẹn ở đây. Thư nhắc
                        // định kỳ mà không có đường từ chối vừa là điểm trừ với bộ lọc thư rác,
                        // vừa là thứ người dùng có quyền đòi hỏi -- cần bổ sung.
                        "<p style=\"margin:0;\">Bạn nhận được thư này vì đang có tài khoản"
                            + " DeutschPfad và hôm nay chưa ôn từ vựng.</p>"
                    )
                );
                sentCount++;
            }
        }
        log.info("Streak reminder ({}): đã gửi email nhắc học cho {}/{} user", subject, sentCount, verifiedUsers.size());
    }
}
