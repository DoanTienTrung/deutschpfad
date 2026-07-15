package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class LearningStreakService {

    private final LearningStreakRepository streakRepository;

    public LearningStreakService(LearningStreakRepository streakRepository) {
        this.streakRepository = streakRepository;
    }

    public LearningStreak recordActivity(User user) {
        LearningStreak streak = streakRepository.findByUser(user)
            .orElseGet(() -> {
                LearningStreak created = new LearningStreak();
                created.setUser(user);
                return created;
            });

        LocalDate today = LocalDate.now();
        LocalDate lastActive = streak.getLastActiveDate();

        if (lastActive == null || lastActive.equals(today.minusDays(1))) {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else if (!lastActive.equals(today)) {
            streak.setCurrentStreak(1);
        }
        // nếu lastActive đã là hôm nay: giữ nguyên currentStreak, không cộng thêm lần 2 trong ngày

        streak.setLongestStreak(Math.max(streak.getLongestStreak(), streak.getCurrentStreak()));
        streak.setLastActiveDate(today);
        streak.setUpdatedAt(LocalDateTime.now());
        return streakRepository.save(streak);
    }

    public LearningStreak getStreak(User user) {
        return streakRepository.findByUser(user).orElseGet(() -> {
            LearningStreak empty = new LearningStreak();
            empty.setUser(user);
            return empty;
        });
    }
}
