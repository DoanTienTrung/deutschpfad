package com.deutschpfad.backend.vocabulary;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/study-time")
public class StudyTimeController {

    // Heartbeats fire every ~30s from the client, but cap the accepted delta generously above
    // that so a stale/replayed/tampered request can't inflate a day's total by much.
    private static final int MAX_SECONDS_PER_HEARTBEAT = 300;

    private final StudyTimeDailyRepository studyTimeRepository;
    private final UserRepository userRepository;

    public StudyTimeController(StudyTimeDailyRepository studyTimeRepository, UserRepository userRepository) {
        this.studyTimeRepository = studyTimeRepository;
        this.userRepository = userRepository;
    }

    public record HeartbeatRequest(@Min(1) int seconds) {}

    public record SummaryResponse(long todaySeconds, long weekSeconds, long totalSeconds) {}

    @PostMapping("/heartbeat")
    @Transactional
    public void heartbeat(@Valid @RequestBody HeartbeatRequest request, Authentication authentication) {
        User user = currentUser(authentication);
        int seconds = Math.min(request.seconds(), MAX_SECONDS_PER_HEARTBEAT);
        LocalDate today = LocalDate.now();

        StudyTimeDaily entry = studyTimeRepository.findByUserAndStudyDate(user, today)
            .orElseGet(() -> {
                StudyTimeDaily e = new StudyTimeDaily();
                e.setUser(user);
                e.setStudyDate(today);
                e.setSeconds(0);
                return e;
            });
        entry.setSeconds(entry.getSeconds() + seconds);
        studyTimeRepository.save(entry);
    }

    @GetMapping("/summary")
    public SummaryResponse summary(Authentication authentication) {
        User user = currentUser(authentication);
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        long todaySeconds = studyTimeRepository.findByUserAndStudyDate(user, today)
            .map(StudyTimeDaily::getSeconds).map(Integer::longValue).orElse(0L);
        long weekSeconds = studyTimeRepository.findByUserAndStudyDateGreaterThanEqual(user, weekStart).stream()
            .mapToLong(StudyTimeDaily::getSeconds).sum();
        long totalSeconds = studyTimeRepository.sumSecondsByUser(user);

        return new SummaryResponse(todaySeconds, weekSeconds, totalSeconds);
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
