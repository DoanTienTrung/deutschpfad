#!/usr/bin/env bash
# Khôi phục nội dung học từ backup.sql vào một database MỚI, RỖNG (máy chủ mới sau khi tài khoản AWS
# bị đóng, xem ops/server-setup.md).
#
# backup.sql là bản dump CHỈ CÓ DỮ LIỆU (không có lệnh tạo bảng) ngày 19/07/2026, lúc schema ở V37:
#   1. Flyway CLI tạo bảng theo V1-V37 (đều là file SQL, chỉ tạo bảng/cột, không chèn dữ liệu).
#   2. Nạp dữ liệu từ backup.sql, bỏ khối flyway_schema_history trong đó: Flyway ở bước 1 đã tự ghi
#      lịch sử V1-V37, nạp thêm sẽ trùng khoá.
#   3. Xoá token đăng nhập cũ và các tài khoản test (@example.com).
# Sau đó bật backend: Flyway trong ứng dụng tự chạy tiếp V38 trở đi (ngữ pháp, giống và số nhiều danh
# từ, gộp từ trùng, từ vựng "Sống ở Đức", luyện dịch...).
#
# Cách dùng, ở thư mục repo trên server:
#   bash ops/restore-from-backup.sh [đường-dẫn-tới-backup.sql]
# Biến tuỳ chọn: COMPOSE (lệnh docker compose, mặc định dùng docker-compose.prod.yml), ENV_FILE (mặc định .env).
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP="${1:-backup.sql}"
ENV_FILE="${ENV_FILE:-.env}"
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml}"
# Đường dẫn repo dạng Docker hiểu được (Git Bash trên Windows cần C:/..., Linux dùng nguyên pwd).
REPO_DIR="$(pwd -W 2>/dev/null || pwd)"

# Đọc từng biến bằng grep thay vì "source .env": giá trị có dấu cách (vd mật khẩu ứng dụng Gmail) sẽ bị
# shell hiểu thành lệnh và in một phần mật khẩu ra màn hình.
env_value() { grep -E "^$1=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- ; }
PG_USER="$(env_value POSTGRES_USER)"
PG_PASSWORD="$(env_value POSTGRES_PASSWORD)"
PG_DB="$(env_value POSTGRES_DB)"
if [ -z "$PG_USER" ] || [ -z "$PG_PASSWORD" ] || [ -z "$PG_DB" ]; then
  echo "Thiếu POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB trong $ENV_FILE" >&2
  exit 1
fi
if [ ! -f "$BACKUP" ]; then
  echo "Không thấy file $BACKUP" >&2
  exit 1
fi

psql_db() { $COMPOSE exec -T postgres psql -v ON_ERROR_STOP=1 -U "$PG_USER" -d "$PG_DB" "$@"; }

echo "==> 1/5 Bật Postgres"
$COMPOSE up -d postgres
until $COMPOSE exec -T postgres pg_isready -U "$PG_USER" -d "$PG_DB" >/dev/null 2>&1; do sleep 2; done

tables="$(psql_db -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" | tr -d '[:space:]')"
if [ "$tables" != "0" ]; then
  echo "Database $PG_DB đã có $tables bảng. Script chỉ chạy trên database rỗng, dừng lại để không ghi đè." >&2
  exit 1
fi

echo "==> 2/5 Tạo bảng V1-V37 bằng Flyway"
container="$($COMPOSE ps -q postgres)"
network="$(docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}} {{end}}' "$container" | awk '{print $1}')"
MSYS_NO_PATHCONV=1 docker run --rm --network "$network" \
  -v "$REPO_DIR/backend/src/main/resources/db/migration:/flyway/sql:ro" \
  -e FLYWAY_URL="jdbc:postgresql://postgres:5432/$PG_DB" \
  -e FLYWAY_USER="$PG_USER" \
  -e FLYWAY_PASSWORD="$PG_PASSWORD" \
  flyway/flyway:11 -locations=filesystem:/flyway/sql -target=37 migrate

echo "==> 3/5 Nạp dữ liệu từ $BACKUP"
filtered="$(mktemp)"
trap 'rm -f "$filtered"' EXIT
awk '/^COPY public\.flyway_schema_history /{skip=1; next} skip && /^\\\.$/{skip=0; next} !skip' "$BACKUP" > "$filtered"
psql_db -q < "$filtered" > /dev/null

echo "==> 4/5 Xoá token cũ và tài khoản test"
psql_db -q <<'SQL'
BEGIN;
DELETE FROM refresh_tokens;
DELETE FROM email_verification_tokens;
DELETE FROM password_reset_tokens;
CREATE TEMP TABLE test_users AS SELECT id FROM users WHERE email LIKE '%@example.com';
DELETE FROM user_vocabulary      WHERE user_id IN (SELECT id FROM test_users);
DELETE FROM user_decks           WHERE user_id IN (SELECT id FROM test_users);
DELETE FROM learning_streaks     WHERE user_id IN (SELECT id FROM test_users);
DELETE FROM lesson_progress      WHERE user_id IN (SELECT id FROM test_users);
DELETE FROM user_recordings      WHERE user_id IN (SELECT id FROM test_users);
DELETE FROM user_listening_items WHERE user_id IN (SELECT id FROM test_users);
DELETE FROM users                WHERE id IN (SELECT id FROM test_users);
COMMIT;
SQL

echo "==> 5/5 Số dòng sau khi khôi phục"
psql_db <<'SQL'
SELECT 'tài khoản' AS bang, count(*) FROM users
UNION ALL SELECT 'từ vựng', count(*) FROM vocabulary_items
UNION ALL SELECT 'bài học từ vựng', count(*) FROM lessons
UNION ALL SELECT 'bài nghe', count(*) FROM listening_exercises
UNION ALL SELECT 'câu nghe', count(*) FROM listening_sentences
UNION ALL SELECT 'bài đọc', count(*) FROM reading_passages
UNION ALL SELECT 'câu hỏi đọc', count(*) FROM reading_questions
UNION ALL SELECT 'đề luyện nói', count(*) FROM speaking_prompts
UNION ALL SELECT 'flyway mới nhất', max(version::int) FROM flyway_schema_history;
SQL

echo
echo "Xong phần dữ liệu tháng 7. Bước tiếp theo: bật cả hệ thống để backend chạy nốt các migration:"
echo "  $COMPOSE up -d"
