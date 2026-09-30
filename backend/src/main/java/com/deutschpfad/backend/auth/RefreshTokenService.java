package com.deutschpfad.backend.auth;

import com.deutschpfad.backend.auth.RefreshToken.RevokeReason;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Quản lý refresh token theo mô hình xoay vòng (rotation) có phát hiện dùng lại (reuse detection).
 *
 * <p>Ba nguyên tắc:
 * <ol>
 *   <li><b>Chỉ lưu hash</b> — giá trị gốc chỉ nằm trong cookie. Xem {@link SecureTokens}.</li>
 *   <li><b>Mỗi token dùng đúng một lần.</b> Đổi token cũ lấy token mới cùng họ.</li>
 *   <li><b>Token đã dùng mà bị đưa ra lần nữa → thu hồi cả họ.</b> Trong hai người cầm token, ít
 *       nhất một là kẻ trộm, và server không biết ai — nên đá cả hai. Chủ tài khoản đăng nhập lại
 *       được, kẻ trộm thì không.</li>
 * </ol>
 */
@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    /** Kết quả xoay vòng: người dùng (để cấp access token) và refresh token mới dạng gốc (để đặt cookie). */
    public record RotatedSession(User user, String rawRefreshToken) {
    }

    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshExpirationDays;

    public RefreshTokenService(
        RefreshTokenRepository refreshTokenRepository,
        @Value("${app.jwt.refresh-expiration-days}") long refreshExpirationDays
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshExpirationDays = refreshExpirationDays;
    }

    /** Đăng nhập mới → mở một họ token mới. Trả về token gốc để đặt vào cookie. */
    @Transactional
    public String startSession(User user) {
        return issue(user, UUID.randomUUID());
    }

    /**
     * Xác thực refresh token rồi đổi nó lấy token mới cùng họ.
     *
     * <p><b>Vì sao {@code noRollbackFor}:</b> khi phát hiện dùng lại, method này GHI (thu hồi cả
     * họ) rồi mới NÉM lỗi 401. Mặc định Spring rollback transaction khi gặp RuntimeException — tức
     * lệnh thu hồi vừa ghi sẽ bị huỷ ngay, và phát hiện dùng lại thành vô tác dụng mà không có gì
     * báo lỗi. Cả ba chỗ ném {@link InvalidCredentialsException} ở đây đều hoặc chưa ghi gì, hoặc
     * ghi thứ BẮT BUỘC phải giữ lại, nên không rollback là đúng cho cả ba.
     */
    @Transactional(noRollbackFor = InvalidCredentialsException.class)
    public RotatedSession validateAndRotate(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(SecureTokens.hash(rawToken))
            .orElseThrow(() -> new InvalidCredentialsException("Refresh token không hợp lệ"));

        // Kiểm tra "đã thu hồi" TRƯỚC "hết hạn": một token bị đánh cắp đưa ra dùng lại vẫn là dấu
        // hiệu cần phản ứng, kể cả khi bản thân nó đã hết hạn — chuỗi token kế tiếp có thể còn sống.
        if (existing.isRevoked()) {
            throw reuseDetected(existing);
        }
        if (existing.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Refresh token đã hết hạn");
        }

        // Kiểm tra-và-ghi nguyên khối trong DB. Trả về 0 nghĩa là một request khác vừa xoay token
        // này sau lúc ta đọc ở trên — cùng một token được dùng hai lần, xử lý y như dùng lại.
        int claimed = refreshTokenRepository.revokeIfActive(
            existing.getId(), LocalDateTime.now(), RevokeReason.ROTATED
        );
        if (claimed == 0) {
            throw reuseDetected(existing);
        }

        User user = existing.getUser();
        return new RotatedSession(user, issue(user, existing.getFamilyId()));
    }

    /** Đăng xuất: kết thúc cả phiên (cả họ token), không chỉ token hiện tại. */
    @Transactional
    public void endSession(String rawToken) {
        refreshTokenRepository.findByTokenHash(SecureTokens.hash(rawToken)).ifPresent(token ->
            refreshTokenRepository.revokeFamily(token.getFamilyId(), LocalDateTime.now(), RevokeReason.LOGOUT)
        );
    }

    /**
     * Đăng xuất người dùng khỏi mọi thiết bị. Gọi khi đổi hoặc đặt lại mật khẩu: nếu có kẻ đã
     * chiếm được một phiên, đổi mật khẩu phải đá được kẻ đó ra — trước đây thì không.
     */
    @Transactional
    public void endAllSessions(User user) {
        refreshTokenRepository.revokeAllForUser(user, LocalDateTime.now(), RevokeReason.PASSWORD_CHANGED);
    }

    private InvalidCredentialsException reuseDetected(RefreshToken token) {
        int revoked = refreshTokenRepository.revokeFamily(
            token.getFamilyId(), LocalDateTime.now(), RevokeReason.REUSE_DETECTED
        );
        // Chỉ cảnh báo khi thật sự còn token sống bị thu hồi. Họ đã chết sẵn (vd. một tab cũ
        // quên đóng sau khi đăng xuất) thì không có gì đáng báo.
        if (revoked > 0) {
            log.warn(
                "SECURITY: refresh token đã dùng bị đưa ra lần nữa — thu hồi {} token còn hiệu lực "
                    + "của họ {} (user id {})",
                revoked, token.getFamilyId(), token.getUser().getId()
            );
        }
        return new InvalidCredentialsException("Phiên đăng nhập không còn hợp lệ, vui lòng đăng nhập lại");
    }

    private String issue(User user, UUID familyId) {
        String rawToken = SecureTokens.newToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(SecureTokens.hash(rawToken));
        refreshToken.setFamilyId(familyId);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(refreshExpirationDays));
        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }
}
