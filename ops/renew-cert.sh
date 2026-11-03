#!/usr/bin/env bash
# Gia hạn chứng chỉ Let's Encrypt (cron chạy 2 lần/ngày, xem ops/server-setup.md). Chỉ thực sự gia hạn
# khi chứng chỉ còn dưới 30 ngày. Dùng webroot: nginx trong container frontend phục vụ
# /.well-known/acme-challenge/ từ ./certbot-webroot (frontend/nginx.conf).
set -euo pipefail
cd "$(dirname "$0")/.."

docker run --rm \
  -v "$PWD/certbot-etc:/etc/letsencrypt" \
  -v "$PWD/certbot-webroot:/var/www/certbot" \
  certbot/certbot renew --webroot -w /var/www/certbot --quiet

# certbot chạy trong container riêng nên không tự báo được cho nginx: nạp lại cấu hình mỗi lần (rẻ, không
# ngắt kết nối) để nginx dùng chứng chỉ mới nếu vừa gia hạn.
docker compose -f docker-compose.prod.yml exec -T frontend nginx -s reload
