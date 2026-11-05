package com.deutschpfad.backend.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Rào cho tài khoản khách (GuestAccountService). Ai cũng tạo được khách bằng một cú bấm, nên mọi thứ tốn
 * tiền thật (quota AI, Deepgram) phải có trần, cho từng khách và cho tất cả khách cộng lại.
 *
 * <ul>
 *   <li>Chặn hẳn: chức năng đang ẩn trên giao diện nhưng API vẫn mở (Video của tôi, luyện nói, WebSocket
 *       Voice Agent) và đổi mật khẩu (khách không có mật khẩu).</li>
 *   <li>Đếm lượt: các API gọi AI hoặc chuyển giọng nói thành chữ. Đếm trong RAM, khởi động lại là về 0:
 *       chấp nhận được vì đây là trần chống lạm dụng, không phải số liệu.</li>
 * </ul>
 */
@Component
public class GuestAccessFilter extends OncePerRequestFilter {

    static final String GUEST_AUTHORITY = "ROLE_GUEST";
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private record Rule(String method, String pattern) {}

    private static final List<Rule> BLOCKED = List.of(
        new Rule(null, "/api/auth/change-password"),
        new Rule(null, "/api/user-listening-items/**"),
        new Rule("POST", "/api/speaking/*/submit"),
        new Rule(null, "/ws/**")
    );

    private static final List<Rule> AI_METERED = List.of(
        new Rule("POST", "/api/tutor/ask"),
        new Rule("POST", "/api/listening/sentences/*/shadowing-feedback"),
        new Rule("GET", "/api/listening/sentences/*/word-translation"),
        new Rule("GET", "/api/reading/passages/*/word-translation"),
        new Rule("POST", "/api/reading/mine"),
        new Rule("PUT", "/api/reading/mine/*"),
        new Rule("POST", "/api/translation/items/*/check"),
        new Rule("POST", "/api/decks/lookup")
    );

    private final AntPathMatcher matcher = new AntPathMatcher();
    private final int dailyLimitPerGuest;
    private final int dailyLimitAllGuests;

    private LocalDate day = LocalDate.now(ZONE);
    private final Map<String, Integer> usedByGuest = new HashMap<>();
    private int usedByAllGuests = 0;

    public GuestAccessFilter(
        @Value("${app.guest.ai-daily-limit:40}") int dailyLimitPerGuest,
        @Value("${app.guest.ai-daily-limit-total:400}") int dailyLimitAllGuests
    ) {
        this.dailyLimitPerGuest = dailyLimitPerGuest;
        this.dailyLimitAllGuests = dailyLimitAllGuests;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean guest = auth != null
            && auth.getAuthorities().stream().anyMatch(a -> GUEST_AUTHORITY.equals(a.getAuthority()));
        if (!guest) {
            filterChain.doFilter(request, response);
            return;
        }

        if (matches(BLOCKED, request)) {
            reject(response, 403, "Tài khoản dùng thử không dùng được chức năng này. Đăng ký miễn phí để dùng đầy đủ.");
            return;
        }
        if (matches(AI_METERED, request) && !tryConsume(auth.getName())) {
            reject(response, 429, "Tài khoản dùng thử đã hết lượt dùng AI hôm nay. Đăng ký miễn phí để dùng tiếp.");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean matches(List<Rule> rules, HttpServletRequest request) {
        String path = request.getRequestURI();
        return rules.stream().anyMatch(rule ->
            (rule.method() == null || rule.method().equalsIgnoreCase(request.getMethod()))
                && matcher.match(rule.pattern(), path)
        );
    }

    synchronized boolean tryConsume(String guestKey) {
        LocalDate today = LocalDate.now(ZONE);
        if (!today.equals(day)) {
            day = today;
            usedByGuest.clear();
            usedByAllGuests = 0;
        }
        int used = usedByGuest.getOrDefault(guestKey, 0);
        if (used >= dailyLimitPerGuest || usedByAllGuests >= dailyLimitAllGuests) return false;
        usedByGuest.put(guestKey, used + 1);
        usedByAllGuests++;
        return true;
    }

    private static void reject(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
