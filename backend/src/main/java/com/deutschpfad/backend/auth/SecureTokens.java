package com.deutschpfad.backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Sinh và băm token bí mật: refresh token, token xác thực email, token đặt lại mật khẩu.
 *
 * <p><b>Nguyên tắc:</b> giá trị gốc chỉ tồn tại ở phía người dùng (cookie, link trong email).
 * Database chỉ giữ {@link #hash}. Nếu DB bị lộ — qua backup, snapshot RDS, hay lỗi SQL injection —
 * kẻ tấn công chỉ có được các chuỗi băm, không dùng được để đăng nhập hay đặt lại mật khẩu.
 *
 * <p><b>Vì sao SHA-256 mà không phải bcrypt:</b> bcrypt được thiết kế <i>cố tình chậm</i> để
 * chống dò mật khẩu do người đặt (ít entropy, dễ đoán). Token ở đây là 256 bit ngẫu nhiên từ
 * {@link SecureRandom} — dò vét cạn là bất khả thi dù hash nhanh cỡ nào. Thêm nữa bcrypt có salt
 * ngẫu nhiên, nên cùng một token cho ra hash khác nhau mỗi lần — không tra cứu bằng phép so bằng
 * ({@code WHERE token_hash = ?}) được, mà đó lại chính là thao tác cần làm ở mỗi request.
 */
final class SecureTokens {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder URL_SAFE = Base64.getUrlEncoder().withoutPadding();
    private static final int TOKEN_BYTES = 32;

    private SecureTokens() {
    }

    /** 256 bit ngẫu nhiên, mã hoá base64url — an toàn để đặt thẳng vào URL và cookie. */
    static String newToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        RANDOM.nextBytes(bytes);
        return URL_SAFE.encodeToString(bytes);
    }

    /**
     * SHA-256 của chuỗi UTF-8, dạng hex chữ thường.
     *
     * <p><b>Phải khớp từng byte</b> với biểu thức SQL trong migration V65
     * ({@code encode(sha256(convert_to(x, 'UTF8')), 'hex')}), vì migration đó băm tại chỗ các token
     * đang còn hạn — lệch một chút là mọi phiên đăng nhập hiện có bị đá ra. Có test canh chuyện này.
     */
    static String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 là thuật toán bắt buộc phải có trên mọi JVM theo đặc tả Java SE.
            throw new IllegalStateException("JVM không hỗ trợ SHA-256", e);
        }
    }
}
