package com.deutschpfad.backend.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
public class RefreshToken {

    public enum RevokeReason {
        /** Xoay vòng bình thường: đổi lấy token kế tiếp cùng họ. */
        ROTATED,
        /** Người dùng tự đăng xuất. */
        LOGOUT,
        /** Token đã xoay bị đưa ra dùng lại — dấu hiệu bị đánh cắp. Đây là sự kiện bảo mật. */
        REUSE_DETECTED,
        /** Đổi hoặc đặt lại mật khẩu → đăng xuất mọi thiết bị. */
        PASSWORD_CHANGED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** SHA-256 của token — giá trị gốc chỉ nằm trong cookie của người dùng. Xem {@link SecureTokens}. */
    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    /**
     * Mọi token sinh ra từ cùng một lần đăng nhập (qua các lần xoay vòng) chung một họ. Phát hiện
     * dùng lại thì thu hồi cả họ — xem {@link RefreshTokenService#validateAndRotate}.
     */
    @Column(name = "family_id", nullable = false)
    private UUID familyId;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "revoke_reason", length = 20)
    private RevokeReason revokeReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
