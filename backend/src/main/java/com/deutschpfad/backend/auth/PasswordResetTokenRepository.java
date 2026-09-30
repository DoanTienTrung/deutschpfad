package com.deutschpfad.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /**
     * Đánh dấu đã dùng <b>chỉ khi chưa dùng</b>, trả về số dòng bị đổi (0 hoặc 1). Cùng cơ chế
     * chống race condition với {@link RefreshTokenRepository#revokeIfActive}: hai request dùng
     * cùng một link đặt lại mật khẩu thì chỉ đúng một request được đặt mật khẩu mới.
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.id = :id AND t.used = false")
    int markUsedIfUnused(@Param("id") Long id);

    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now OR t.used = true")
    int deleteExpiredOrUsed(@Param("now") LocalDateTime now);
}
