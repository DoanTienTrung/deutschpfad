package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import com.deutschpfad.backend.common.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StreakReminderService {

    private static final Logger log = LoggerFactory.getLogger(StreakReminderService.class);

    private final UserRepository userRepository;
    private final LearningStreakRepository streakRepository;
    private final EmailService emailService;

    public StreakReminderService(
        UserRepository userRepository,
        LearningStreakRepository streakRepository,
        EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.streakRepository = streakRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 20 * * *")
    public void sendDailyReminders() {
        LocalDate today = LocalDate.now();
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
                emailService.send(
                    user.getEmail(),
                    "Đừng quên học tiếng Đức hôm nay!",
                    "Chào " + user.getFullName() + ",\n\n"
                        + "Bạn chưa ôn từ vựng hôm nay. Dành vài phút ôn flashcard để giữ streak học tập nhé!\n\n"
                        + "— DeutschPfad"
                );
                sentCount++;
            }
        }
        log.info("Streak reminder: đã gửi email nhắc học cho {}/{} user", sentCount, verifiedUsers.size());
    }
}
