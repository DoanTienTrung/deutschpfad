package com.deutschpfad.backend.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Tài khoản khách cho nút "Dùng thử không cần đăng ký" (nhà tuyển dụng, người tò mò).
 *
 * <p>Mỗi lượt bấm là một tài khoản riêng, nên không ai đổi được mật khẩu hay xoá tiến độ của người
 * khác như khi phát chung một tài khoản demo. Mật khẩu là chuỗi ngẫu nhiên không ai biết: chỉ vào được
 * bằng cookie cấp lúc tạo. Giới hạn chức năng tốn tiền nằm ở GuestAccessFilter.
 */
@Service
public class GuestAccountService {

    private static final Logger log = LoggerFactory.getLogger(GuestAccountService.class);

    /** Tên miền .invalid được dành riêng (RFC 2606): không thể trùng email thật của ai. */
    static final String EMAIL_DOMAIN = "@guest.deutschpfad.invalid";
    static final Duration LIFETIME = Duration.ofHours(24);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final int maxActiveGuests;

    public GuestAccountService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.guest.enabled:true}") boolean enabled,
        // Chặn trần để ai đó đổi IP liên tục cũng không làm đầy được database (Neon free chỉ có 1GB).
        @Value("${app.guest.max-active:200}") int maxActiveGuests
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.maxActiveGuests = maxActiveGuests;
    }

    @Transactional
    public User createGuest() {
        if (!enabled) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE, "Chế độ dùng thử đang tạm tắt, vui lòng đăng ký tài khoản"
            );
        }
        if (userRepository.countByGuestTrue() >= maxActiveGuests) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Đang có quá nhiều người dùng thử, vui lòng thử lại sau hoặc đăng ký tài khoản"
            );
        }

        byte[] suffix = new byte[6];
        ThreadLocalRandom.current().nextBytes(suffix);

        User user = new User();
        user.setEmail("guest-" + HexFormat.of().formatHex(suffix) + EMAIL_DOMAIN);
        user.setPasswordHash(passwordEncoder.encode(SecureTokens.newToken()));
        user.setFullName("Khách");
        user.setEmailVerified(true);
        user.setGuest(true);
        return userRepository.save(user);
    }

    /** Mỗi giờ một lần. Khoá ngoại tới users đều ON DELETE CASCADE (V78) nên dữ liệu đi theo luôn. */
    @Scheduled(cron = "0 15 * * * *")
    @Transactional
    public void deleteExpiredGuests() {
        int deleted = userRepository.deleteGuestsCreatedBefore(LocalDateTime.now().minus(LIFETIME));
        if (deleted > 0) {
            log.info("Đã xoá {} tài khoản khách quá {} giờ", deleted, LIFETIME.toHours());
        }
    }
}
