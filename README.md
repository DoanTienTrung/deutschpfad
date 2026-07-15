# DeutschPfad

Website học tiếng Đức và luyện thi chứng chỉ (Goethe/telc/TestDaF) phục vụ du học/làm việc tại Đức.

## Công nghệ

- **Backend**: Java 21 + Spring Boot, PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Hạ tầng**: Docker, Docker Compose (local) → AWS Free Tier (production, xem `docs/phase-8-aws-deployment.md`)

## Cấu trúc dự án

```
DeutschPfad/
├── backend/     # Spring Boot API
├── frontend/    # React SPA
├── docs/        # Checklist tiến độ theo từng phase phát triển
├── docker-compose.yml
└── .env.example
```

## Chạy dự án local qua Docker (khuyến nghị)

1. Tạo file `.env` từ mẫu:
   ```powershell
   copy .env.example .env
   ```
2. Build và khởi động toàn bộ stack:
   ```powershell
   docker compose up -d --build
   ```
3. Truy cập:
   - Frontend: http://localhost:8081
   - Backend API: http://localhost:8080
   - Health check: http://localhost:8080/api/health

4. Dừng toàn bộ:
   ```powershell
   docker compose down
   ```
   (dữ liệu Postgres vẫn giữ nguyên trong volume `postgres_data`; dùng `docker compose down -v` nếu muốn xoá luôn dữ liệu)

## Chạy riêng từng phần (khi phát triển)

**Backend** (cần Postgres đang chạy — có thể chỉ chạy riêng service này qua `docker compose up -d postgres`):
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
Mặc định kết nối Postgres qua `localhost:5433` (xem `application.yaml`).

**Frontend** (dev server có hot-reload, tự proxy `/api` sang backend cổng 8080):
```powershell
cd frontend
npm run dev
```
Truy cập http://localhost:5173

## Biến môi trường

Xem `.env.example` — gồm `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` dùng chung cho
Postgres và backend trong `docker-compose.yml`.

## Theo dõi tiến độ

Toàn bộ kế hoạch phát triển được chia theo phase, mỗi phase có 1 file checklist trong
[`docs/`](./docs):

- [phase-0-infra.md](./docs/phase-0-infra.md) — Hạ tầng dự án
- [phase-1-auth.md](./docs/phase-1-auth.md) — Đăng ký/đăng nhập
- [phase-2-vocabulary.md](./docs/phase-2-vocabulary.md) — Từ vựng *(ưu tiên)*
- [phase-3-listening-speaking.md](./docs/phase-3-listening-speaking.md) — Nghe & Nói *(ưu tiên)*
- [phase-4-reading-writing.md](./docs/phase-4-reading-writing.md) — Đọc & Viết
- [phase-5-grammar.md](./docs/phase-5-grammar.md) — Ngữ pháp
- [phase-6-exam-engine.md](./docs/phase-6-exam-engine.md) — Luyện thi chứng chỉ đầy đủ + chấm AI
- [phase-7-community-personalization.md](./docs/phase-7-community-personalization.md) — Cộng đồng & lộ trình cá nhân hoá
- [phase-8-aws-deployment.md](./docs/phase-8-aws-deployment.md) — Triển khai AWS

## Ôn tập kiến thức

[docs/kien-thuc-da-hoc.md](./docs/kien-thuc-da-hoc.md) — tổng hợp khái niệm/kỹ thuật/bẫy thực
tế đã gặp qua từng phase (Docker, Spring Security, JWT, Testing...), cập nhật sau mỗi phase
hoàn thành, dùng để ôn lại khi cần.
