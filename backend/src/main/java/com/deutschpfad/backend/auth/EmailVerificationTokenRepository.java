package com.deutschpfad.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);

    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now")
    int deleteExpired(@Param("now") LocalDateTime now);

    // Dùng khi gửi lại email xác thực: link cũ phải chết ngay. Nếu không, thư cũ và thư mới nằm
    // cạnh nhau trong hộp thư và người dùng rất dễ bấm nhầm đúng cái link vừa báo hết hạn.
    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.user = :user")
    int deleteByUser(@Param("user") User user);
}
