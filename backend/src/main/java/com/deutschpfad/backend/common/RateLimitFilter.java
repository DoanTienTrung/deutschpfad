package com.deutschpfad.backend.common;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Supplier<Bucket>> limitedPaths = Map.of(
        "/api/auth/login", () -> newBucket(5, Duration.ofMinutes(1)),
        "/api/auth/register", () -> newBucket(5, Duration.ofMinutes(1)),
        "/api/auth/forgot-password", () -> newBucket(3, Duration.ofMinutes(5)),
        // Mỗi lần gọi là một email thật được gửi đi -- giới hạn chặt như forgot-password.
        "/api/auth/resend-verification", () -> newBucket(3, Duration.ofMinutes(5)),
        "/api/tutor/ask", () -> newBucket(20, Duration.ofMinutes(5))
    );

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket newBucket(int capacity, Duration period) {
        Bandwidth limit = Bandwidth.builder()
            .capacity(capacity)
            .refillIntervally(capacity, period)
            .build();
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        Supplier<Bucket> bucketSupplier = limitedPaths.get(request.getRequestURI());

        if (bucketSupplier != null) {
            String clientIp = extractClientIp(request);
            String key = request.getRequestURI() + ":" + clientIp;
            Bucket bucket = buckets.computeIfAbsent(key, k -> bucketSupplier.get());

            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(
                    "{\"message\":\"Quá nhiều yêu cầu, vui lòng thử lại sau ít phút\"}"
                );
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * IP của người gửi. Trước đây đọc X-Real-IP do nginx đặt; trên Render không còn nginx nên header đó
     * do chính client gửi, đổi mỗi request một giá trị là lách được giới hạn.
     *
     * <p>CF-Connecting-IP: Cloudflare (đứng trước Render) ghi đè header này bằng IP thật. Không có thì
     * dùng getRemoteAddr(), mà ForwardedHeaderFilter (server.forward-headers-strategy=framework) đã thay
     * bằng IP đầu tiên trong X-Forwarded-For, vị trí Render cho biết là IP thật. Cả hai vẫn chỉ đáng tin
     * khi request thật sự đi qua proxy đó, nên đăng nhập còn bị giới hạn theo email ở LoginAttemptLimiter,
     * thứ client không giả được.
     */
    static String extractClientIp(HttpServletRequest request) {
        String cloudflareIp = request.getHeader("CF-Connecting-IP");
        if (cloudflareIp != null && !cloudflareIp.isBlank()) {
            return cloudflareIp.trim();
        }
        return request.getRemoteAddr();
    }
}
