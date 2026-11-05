-- Tài khoản khách cho nút "Dùng thử không cần đăng ký": tạo bằng một cú bấm, tự xoá sau 24 giờ
-- (GuestAccountService). Người xem thử không phải đăng ký, cũng không có mật khẩu chung nào bị lộ.
ALTER TABLE users ADD COLUMN guest BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_users_guest_created_at ON users (created_at) WHERE guest;

-- Xoá một tài khoản phải kéo theo toàn bộ dữ liệu của nó. Các bảng tạo từ V2 tới V19 khai báo khoá
-- ngoại tới users mà không có ON DELETE CASCADE, nên DELETE FROM users sẽ bị chặn. Tìm theo catalog
-- thay vì gõ tên ràng buộc: tên do Postgres tự đặt, không chắc giống hệt nhau trên mọi database.
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT c.conname, c.conrelid::regclass AS tbl, a.attname AS col
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
        WHERE c.contype = 'f'
          AND c.confrelid = 'users'::regclass
          AND c.confdeltype <> 'c'
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.tbl, fk.conname);
        EXECUTE format(
            'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES users (id) ON DELETE CASCADE',
            fk.tbl, fk.conname, fk.col
        );
    END LOOP;
END $$;
