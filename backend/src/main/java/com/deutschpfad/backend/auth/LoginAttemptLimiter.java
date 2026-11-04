package com.deutschpfad.backend.auth;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Giới hạn số lần đăng nhập SAI cho từng email, bất kể gửi từ IP nào.
 *
 * <p>RateLimitFilter giới hạn theo IP, nhưng IP lấy từ header do proxy đặt: request không đi qua proxy
 * đó, hoặc proxy chỉ nối thêm vào header client gửi, là đổi IP giả mỗi lần và thử mật khẩu vô hạn. Email
 * nằm trong chính request đăng nhập nên không giả được: đoán mật khẩu một tài khoản bị chặn ở đây.
 *
 * <p>Giữ trong bộ nhớ (chỉ một instance chạy); khởi động lại là đếm lại từ đầu.
 */
@Component
public class LoginAttemptLimiter {

    static final int MAX_FAILURES = 10;
    static final Duration WINDOW = Duration.ofMinutes(15);
    // Chặn kẻ gửi hàng loạt email ngẫu nhiên làm phình bộ nhớ: quá ngưỡng thì xoá sạch, đếm lại.
    private static final int MAX_TRACKED_EMAILS = 10_000;

    private final Map<String, Bucket> failures = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        Bucket bucket = failures.get(key(email));
        return bucket != null && bucket.getAvailableTokens() == 0;
    }

    public void recordFailure(String email) {
        if (failures.size() >= MAX_TRACKED_EMAILS) {
            failures.clear();
        }
        failures.computeIfAbsent(key(email), k -> newBucket()).tryConsume(1);
    }

    public void reset(String email) {
        failures.remove(key(email));
    }

    private static String key(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder()
            .capacity(MAX_FAILURES)
            .refillIntervally(MAX_FAILURES, WINDOW)
            .build();
        return Bucket.builder().addLimit(limit).build();
    }
}
