package com.deutschpfad.backend.dashboard;

import com.deutschpfad.backend.auth.User;
import com.deutschpfad.backend.auth.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public DashboardResponse get(Authentication authentication) {
        return dashboardService.build(currentUser(authentication));
    }

    public record DailyGoalRequest(@Min(5) @Max(120) int minutes) {}

    @PutMapping("/daily-goal")
    public DailyGoalRequest setDailyGoal(@Valid @RequestBody DailyGoalRequest request, Authentication authentication) {
        User user = currentUser(authentication);
        user.setDailyGoalMinutes(request.minutes());
        userRepository.save(user);
        return request;
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
    }
}
