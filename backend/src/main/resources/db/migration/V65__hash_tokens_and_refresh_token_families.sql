-- Bảo mật token: băm cả 3 loại token bí mật, và thêm "họ token" cho refresh token.
--
-- Trước đây cả 3 bảng lưu nguyên giá trị token. DB lộ (backup, snapshot, SQL injection) là kẻ tấn
-- công dùng được ngay: refresh token → chiếm phiên, token đặt lại mật khẩu → chiếm tài khoản.


-- ---------------------------------------------------------------------------------------------
-- 1. Lưu SHA-256 thay cho giá trị gốc
--
-- Băm TẠI CHỖ thay vì xoá: người dùng đang đăng nhập giữ nguyên phiên, link xác thực/đặt lại
-- mật khẩu đã gửi đi vẫn bấm được. Server băm giá trị gửi lên rồi so với cột này.
--
-- Biểu thức băm PHẢI khớp từng byte với SecureTokens.hash() bên Java (SHA-256 của chuỗi UTF-8,
-- xuất hex chữ thường). Có test kiểm chứng hai bên cho ra cùng kết quả.
--
-- sha256() có sẵn từ PostgreSQL 11, không cần extension pgcrypto.
-- ---------------------------------------------------------------------------------------------

ALTER TABLE refresh_tokens RENAME COLUMN token TO token_hash;
UPDATE refresh_tokens SET token_hash = encode(sha256(convert_to(token_hash, 'UTF8')), 'hex');

ALTER TABLE email_verification_tokens RENAME COLUMN token TO token_hash;
UPDATE email_verification_tokens SET token_hash = encode(sha256(convert_to(token_hash, 'UTF8')), 'hex');

ALTER TABLE password_reset_tokens RENAME COLUMN token TO token_hash;
UPDATE password_reset_tokens SET token_hash = encode(sha256(convert_to(token_hash, 'UTF8')), 'hex');


-- ---------------------------------------------------------------------------------------------
-- 2. Họ token (token family) cho refresh token
--
-- Mỗi lần đăng nhập mở một họ mới; mỗi lần xoay vòng, token kế tiếp thuộc cùng họ. Khi phát hiện
-- một token ĐÃ XOAY bị dùng lại — dấu hiệu token bị đánh cắp — thu hồi CẢ HỌ, đá cả kẻ trộm lẫn
-- chủ tài khoản ra. Chủ tài khoản đăng nhập lại được, kẻ trộm thì không.
--
-- Trước đây code chỉ từ chối token bị dùng lại mà không làm gì thêm. Nếu kẻ trộm dùng token
-- TRƯỚC chủ tài khoản thì chúng giữ được chuỗi token hợp lệ, còn người bị đá ra lại là chủ.
--
-- Token hiện có: mỗi token một họ riêng. gen_random_uuid() có sẵn từ PostgreSQL 13.
-- ---------------------------------------------------------------------------------------------

ALTER TABLE refresh_tokens ADD COLUMN family_id UUID;
UPDATE refresh_tokens SET family_id = gen_random_uuid();
ALTER TABLE refresh_tokens ALTER COLUMN family_id SET NOT NULL;

CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id);
-- Cho thao tác "đăng xuất mọi thiết bị" khi đổi/đặt lại mật khẩu. PostgreSQL không tự tạo index
-- cho cột khoá ngoại.
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);


-- ---------------------------------------------------------------------------------------------
-- 3. Ghi lại khi nào và vì sao token bị thu hồi
--
-- Cần để phân biệt khi điều tra: token bị thu hồi vì xoay vòng bình thường (ROTATED), vì người
-- dùng đăng xuất (LOGOUT), vì phát hiện dùng lại (REUSE_DETECTED — sự kiện bảo mật), hay vì
-- đổi mật khẩu (PASSWORD_CHANGED).
-- ---------------------------------------------------------------------------------------------

ALTER TABLE refresh_tokens ADD COLUMN revoked_at TIMESTAMP;
ALTER TABLE refresh_tokens ADD COLUMN revoke_reason VARCHAR(20);
