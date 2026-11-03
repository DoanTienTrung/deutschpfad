#!/usr/bin/env bash
# Cập nhật IP cho deutschpfad.duckdns.org (cron 5 phút/lần, xem ops/server-setup.md). Để trống ip= thì
# DuckDNS lấy IP công khai của máy gửi yêu cầu, nên máy Oracle có đổi IP sau khi khởi động lại thì tên
# miền cũng tự đổi theo.
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN="$(grep -E '^DUCKDNS_TOKEN=' .env | tail -n 1 | cut -d= -f2-)"
if [ -z "$TOKEN" ]; then
  echo "Thiếu DUCKDNS_TOKEN trong .env" >&2
  exit 1
fi
RESULT="$(curl -fsS "https://www.duckdns.org/update?domains=deutschpfad&token=${TOKEN}&ip=")"
if [ "$RESULT" != "OK" ]; then
  echo "DuckDNS trả về: $RESULT" >&2
  exit 1
fi
