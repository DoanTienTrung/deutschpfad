package com.deutschpfad.backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshExpirationDays;

    public RefreshTokenService(
        RefreshTokenRepository refreshTokenRepository,
        @Value("${app.jwt.refresh-expiration-days}") long refreshExpirationDays
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshExpirationDays = refreshExpirationDays;
    }

    public RefreshToken generate(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(refreshExpirationDays));
        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Xác thực refresh token và "xoay vòng" (rotation): thu hồi token cũ, phát hành token mới.
     * Rotation giúp phát hiện việc token bị đánh cắp — nếu ai đó dùng lại 1 token đã bị thu hồi,
     * đó là dấu hiệu rõ ràng của hành vi bất thường.
     */
    public RefreshToken validateAndRotate(String token) {
        RefreshToken existing = refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new InvalidCredentialsException("Refresh token không hợp lệ"));

        if (existing.isRevoked()) {
            throw new InvalidCredentialsException("Refresh token đã bị thu hồi");
        }
        if (existing.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Refresh token đã hết hạn");
        }

        existing.setRevoked(true);
        refreshTokenRepository.save(existing);

        return generate(existing.getUser());
    }

    public void revoke(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }
}
