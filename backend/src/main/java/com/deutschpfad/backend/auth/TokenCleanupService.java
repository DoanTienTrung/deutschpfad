package com.deutschpfad.backend.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TokenCleanupService {

    private static final Logger log = LoggerFactory.getLogger(TokenCleanupService.class);

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public TokenCleanupService(
        EmailVerificationTokenRepository emailVerificationTokenRepository,
        PasswordResetTokenRepository passwordResetTokenRepository,
        RefreshTokenRepository refreshTokenRepository
    ) {
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int emailTokensDeleted = emailVerificationTokenRepository.deleteExpired(now);
        int passwordTokensDeleted = passwordResetTokenRepository.deleteExpiredOrUsed(now);
        int refreshTokensDeleted = refreshTokenRepository.deleteExpiredOrRevoked(now);
        log.info(
            "Token cleanup: xoá {} email verification token hết hạn, {} password reset token "
                + "hết hạn/đã dùng, {} refresh token hết hạn/đã thu hồi",
            emailTokensDeleted, passwordTokensDeleted, refreshTokensDeleted
        );
    }
}
