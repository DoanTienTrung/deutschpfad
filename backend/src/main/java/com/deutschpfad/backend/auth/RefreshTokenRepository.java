package com.deutschpfad.backend.auth;

import com.deutschpfad.backend.auth.RefreshToken.RevokeReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * Thu hồi token <b>chỉ khi nó còn hiệu lực</b>, và trả về số dòng bị đổi (0 hoặc 1).
     *
     * <p>Đây là cách chống race condition khi xoay vòng. Kiểu cũ — đọc lên, kiểm tra
     * {@code revoked == false} trong Java, rồi mới ghi — để hở một khoảng: hai request cùng đọc
     * thấy "còn hiệu lực" trước khi bên nào kịp ghi, và cả hai cùng đổi được token.
     *
     * <p>Gói điều kiện vào chính câu {@code UPDATE} thì việc kiểm tra và ghi xảy ra nguyên khối
     * trong database. Request thứ hai phải chờ khoá dòng của request thứ nhất; khi được chạy,
     * PostgreSQL đánh giá lại {@code WHERE revoked = false} trên phiên bản dòng mới nhất → thấy đã
     * thu hồi → trả về 0. Nên luôn chỉ đúng MỘT request thắng.
     *
     * <p><b>Thêm {@code @Transactional} vào code cũ KHÔNG sửa được lỗi này.</b> PostgreSQL mặc định
     * chạy mức cô lập READ COMMITTED: hai transaction vẫn cùng đọc thấy {@code revoked = false}.
     * {@code @Transactional} chỉ làm các lệnh ghi thành nguyên khối, không ngăn hai luồng cùng đọc.
     */
    @Modifying
    @Query("""
        UPDATE RefreshToken t
           SET t.revoked = true, t.revokedAt = :now, t.revokeReason = :reason
         WHERE t.id = :id AND t.revoked = false
        """)
    int revokeIfActive(@Param("id") Long id, @Param("now") LocalDateTime now,
                       @Param("reason") RevokeReason reason);

    /** Thu hồi mọi token còn hiệu lực trong một họ (một phiên đăng nhập). Trả về số token bị thu hồi. */
    @Modifying
    @Query("""
        UPDATE RefreshToken t
           SET t.revoked = true, t.revokedAt = :now, t.revokeReason = :reason
         WHERE t.familyId = :familyId AND t.revoked = false
        """)
    int revokeFamily(@Param("familyId") UUID familyId, @Param("now") LocalDateTime now,
                     @Param("reason") RevokeReason reason);

    /** Thu hồi mọi phiên của một người dùng trên mọi thiết bị. */
    @Modifying
    @Query("""
        UPDATE RefreshToken t
           SET t.revoked = true, t.revokedAt = :now, t.revokeReason = :reason
         WHERE t.user = :user AND t.revoked = false
        """)
    int revokeAllForUser(@Param("user") User user, @Param("now") LocalDateTime now,
                         @Param("reason") RevokeReason reason);

    /**
     * Chỉ xoá token <b>đã hết hạn</b> — KHÔNG xoá token đã thu hồi mà còn hạn.
     *
     * <p>Trước đây job dọn dẹp xoá cả token đã thu hồi ({@code OR t.revoked = true}). Nghe thì gọn
     * gàng, nhưng nó xoá mất bằng chứng: sau 3 giờ sáng, một token bị đánh cắp đưa ra dùng lại chỉ
     * còn là "không tìm thấy" chứ không còn nhận ra được là "đã thu hồi" — tức khả năng phát hiện
     * dùng lại biến mất sau mỗi đêm. Giữ lại tới khi hết hạn gốc thì mới phát hiện được.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken t WHERE t.expiresAt < :now")
    int deleteExpired(@Param("now") LocalDateTime now);
}
