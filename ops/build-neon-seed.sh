#!/usr/bin/env bash
# Dựng file neon-seed.sql: toàn bộ schema + nội dung học ở phiên bản migration mới nhất, để nạp một lần
# vào database Neon rỗng (ops/render-neon-setup.md, Bước 3).
#
# Vì sao không nạp backup.sql thẳng lên Neon rồi để backend tự chạy migration như trên máy chủ tự quản:
# backup.sql là dump chỉ-dữ-liệu có "ALTER TABLE ... DISABLE TRIGGER ALL", lệnh cần quyền superuser mà
# Neon không cấp. Làm hết ở máy nhà trên một Postgres tạm (có superuser), rồi xuất ra một file SQL thường
# (--no-owner --no-privileges) mà tài khoản Neon nào cũng nạp được.
#
#   1. Postgres tạm (ops/seed-db.yml) + ops/restore-from-backup.sh: bảng V1-V37 + dữ liệu 19/07/2026.
#   2. Chạy chính image production (Dockerfile.render) trỏ vào DB tạm: Flyway chạy tiếp V38 tới mới nhất.
#   3. pg_dump ra neon-seed.sql ở thư mục gốc repo (đã nằm trong .gitignore: có email + hash mật khẩu).
#   4. Xoá Postgres tạm.
#
# Cách dùng (Git Bash trên Windows hoặc Linux, cần Docker), ở thư mục repo:
#   bash ops/build-neon-seed.sh [đường-dẫn-tới-backup.sql]
set -euo pipefail
cd "$(dirname "$0")/.."
# Git Bash trên Windows tự đổi tham số trông giống đường dẫn (/tmp/seed.sql) thành C:/...: tắt đi để đường
# dẫn BÊN TRONG container giữ nguyên. Đường dẫn file trên máy (file env) thì tự đổi bằng cygpath bên dưới.
export MSYS_NO_PATHCONV=1

BACKUP="${1:-backup.sql}"
OUT="neon-seed.sql"
PROJECT="deutschpfad-seed"
IMAGE="deutschpfad-render:local"
BACKEND="deutschpfad-seed-backend"

env_file="$(mktemp)"
# Mật khẩu ngẫu nhiên cho DB tạm: chỉ sống tới cuối script.
printf 'POSTGRES_USER=seed\nPOSTGRES_PASSWORD=%s\nPOSTGRES_DB=deutschpfad\n' "$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')" > "$env_file"
PG_PASSWORD="$(grep -E '^POSTGRES_PASSWORD=' "$env_file" | cut -d= -f2-)"
env_arg="$(cygpath -m "$env_file" 2>/dev/null || printf '%s' "$env_file")"
COMPOSE="docker compose -p $PROJECT -f ops/seed-db.yml --env-file $env_arg"

cleanup() {
  docker rm -f "$BACKEND" >/dev/null 2>&1 || true
  $COMPOSE down -v >/dev/null 2>&1 || true
  rm -f "$env_file"
}
trap cleanup EXIT

echo "==> A. Dữ liệu tháng 7 vào Postgres tạm"
COMPOSE="$COMPOSE" ENV_FILE="$env_file" bash ops/restore-from-backup.sh "$BACKUP"

echo "==> B. Build image production (Dockerfile.render, vài phút ở lần đầu)"
docker build -f Dockerfile.render -t "$IMAGE" .

echo "==> C. Chạy backend để Flyway chạy nốt migration"
network="${PROJECT}_default"
# Key giả: chỉ cần ứng dụng khởi động được, không gọi AI hay Google nào.
docker run -d --name "$BACKEND" --network "$network" \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=postgres -e DB_PORT=5432 -e DB_NAME=deutschpfad \
  -e DB_USERNAME=seed -e DB_PASSWORD="$PG_PASSWORD" \
  -e GOOGLE_CLIENT_ID=seed -e GOOGLE_CLIENT_SECRET=seed \
  -e JWT_SECRET=seed-only-not-a-real-secret-0123456789abcdefghij \
  -e GROQ_API_KEY=seed -e GEMINI_API_KEY=seed -e OPENROUTER_API_KEY=seed -e COHERE_API_KEY=seed \
  -e LISTENING_IMPORT_NIGHTLY=false -e MAIL_ENABLED=false -e SPRING_JPA_SHOW_SQL=false \
  "$IMAGE" >/dev/null
until docker logs "$BACKEND" 2>&1 | grep -qE "Started BackendApplication|APPLICATION FAILED TO START|Application run failed"; do
  if [ "$(docker inspect -f '{{.State.Running}}' "$BACKEND")" != "true" ]; then break; fi
  sleep 3
done
if ! docker logs "$BACKEND" 2>&1 | grep -q "Started BackendApplication"; then
  docker logs "$BACKEND" 2>&1 | tail -n 60
  echo "Backend không khởi động được, xem log ở trên." >&2
  exit 1
fi
docker logs "$BACKEND" 2>&1 | grep -E "Successfully applied|Schema .* is up to date" || true
docker rm -f "$BACKEND" >/dev/null

echo "==> D. Xuất $OUT"
# --no-owner --no-privileges: không gắn chủ sở hữu/quyền của tài khoản "seed" vào file, Neon nạp bằng
# tài khoản của nó. --no-comments: bỏ "COMMENT ON EXTENSION vector", lệnh chỉ chủ extension được chạy.
$COMPOSE exec -T postgres pg_dump -U seed -d deutschpfad --no-owner --no-privileges --no-comments -f /tmp/seed.sql
docker cp "$($COMPOSE ps -q postgres):/tmp/seed.sql" "$OUT"

echo "==> E. Số dòng để đối chiếu sau khi nạp lên Neon"
$COMPOSE exec -T postgres psql -U seed -d deutschpfad <<'SQL'
SELECT 'tài khoản' AS bang, count(*) FROM users
UNION ALL SELECT 'từ vựng', count(*) FROM vocabulary_items
UNION ALL SELECT 'bài học từ vựng', count(*) FROM lessons
UNION ALL SELECT 'chủ điểm ngữ pháp', count(*) FROM grammar_topics
UNION ALL SELECT 'bài tập ngữ pháp', count(*) FROM grammar_exercises
UNION ALL SELECT 'bài nghe', count(*) FROM listening_exercises
UNION ALL SELECT 'bài đọc', count(*) FROM reading_passages
UNION ALL SELECT 'bộ luyện dịch', count(*) FROM translation_sets
UNION ALL SELECT 'câu luyện dịch', count(*) FROM translation_items
UNION ALL SELECT 'flyway mới nhất', max(version::int) FROM flyway_schema_history;
SQL

echo
echo "Xong: $OUT ($(du -h "$OUT" | cut -f1)). File có email và hash mật khẩu: không gửi cho ai, không commit."
