# Chạy DeutschPfad miễn phí trên Render + Neon

Tài khoản AWS đã đóng (29/10/2026), Oracle Cloud và Azure for Students không đăng ký được. Production
chuyển sang các gói miễn phí không cần máy chủ riêng:

| Phần | Dịch vụ | Gói Free cho gì |
|---|---|---|
| Web (backend + giao diện, một container) | **Render** web service, vùng Singapore | 512MB RAM, 0.1 CPU, 750 giờ/tháng (đủ chạy liên tục 1 service). Ngủ sau 15 phút không có request. Chặn cổng gửi mail 25/465/587. Không có ổ đĩa lưu lâu dài. |
| Database | **Neon** Postgres, vùng Singapore | 1GB lưu trữ, 100 giờ compute/tháng (khoảng 400 giờ ở cỡ nhỏ nhất). Tự ngủ sau 5 phút không dùng, tự dậy khi có truy vấn. Có pgvector. |
| Giữ web thức | **UptimeRobot** | Gọi `/api/ping` 5 phút/lần, để Render không cho web ngủ. |
| Việc admin nặng | **Máy nhà** (docker compose trỏ vào Neon) | Nhập video YouTube, tải PDF gia sư. |

Địa chỉ web mới: `https://<tên-service>.onrender.com` (tên miền DuckDNS cũ bỏ).

Những gì khác so với trước:
- **Email tắt** (`MAIL_ENABLED=false`): đăng ký bằng email là dùng được ngay, không cần bấm link xác thực.
  "Quên mật khẩu" báo người dùng đăng nhập bằng Google hoặc liên hệ admin. Bật lại bằng Brevo: Bước 9.
- **Khởi động chậm**: máy 0.1 CPU khởi động backend khoảng 3 phút (đo ở máy với giới hạn giống Render;
  trước khi thêm CDS trong `Dockerfile.render` là 5 phút). Chỉ xảy ra khi deploy hoặc khi Render tự khởi động lại máy.
- **Deploy tự động**: push lên `main` → GitHub Actions chạy test → xanh thì Render tự build và deploy
  (`render.yaml`, `autoDeployTrigger: checksPass`). Không còn GHCR, SSH hay secret nào trên GitHub.

---

## Bước 1. Tạo database Neon

1. Vào https://neon.com, **Sign up** bằng tài khoản GitHub (không cần thẻ).
2. Tạo project:
   - Project name: `deutschpfad`
   - Postgres version: **16** (trùng bản ở máy nhà; bản khác thì lệnh `pg_dump` ở Bước 10 phải đổi image)
   - Region: **AWS Asia Pacific (Singapore)**
3. Ở trang project, bấm **Connect**. Tắt **Connection pooling** (Flyway cần kết nối trực tiếp: địa chỉ
   KHÔNG có chữ `-pooler`). Bấm hiện mật khẩu rồi copy chuỗi kết nối, dạng:

   ```
   postgresql://neondb_owner:MATKHAU@ep-ten-gi-do-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

4. Từ chuỗi đó ghi ra 4 giá trị (giữ riêng, không gửi ai):

   | Tên | Giá trị |
   |---|---|
   | `NEON_URL` | nguyên chuỗi ở trên |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-ten-gi-do-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
   | `DB_USERNAME` | `neondb_owner` |
   | `DB_PASSWORD` | `MATKHAU` |

## Bước 2. Nạp dữ liệu lên Neon

File `C:\DeutschPfad\neon-seed.sql` đã dựng sẵn ở máy (schema mới nhất + nội dung học từ `backup.sql`,
đã bỏ tài khoản test và token cũ). Muốn dựng lại: `bash ops/build-neon-seed.sh` trong Git Bash.

PowerShell, thay `NEON_URL` bằng chuỗi ở Bước 1 (giữ nguyên dấu ngoặc kép):

```powershell
docker run --rm -v "C:\DeutschPfad:/work" pgvector/pgvector:pg16 psql "NEON_URL" -v ON_ERROR_STOP=1 --single-transaction -q -o /dev/null -f /work/neon-seed.sql
```

Chạy khoảng 1 phút, không in gì là xong (chạy trong một transaction: lỗi giữa chừng thì Neon vẫn rỗng, sửa rồi chạy lại).
Kiểm tra:

```powershell
docker run --rm pgvector/pgvector:pg16 psql "NEON_URL" -c "select (select count(*) from vocabulary_items) as tu_vung, (select count(*) from grammar_topics) as ngu_phap, (select count(*) from translation_sets) as luyen_dich, (select max(version::int) from flyway_schema_history) as flyway"
```

Số phải khớp bảng in ra lúc dựng file (xem phần cuối file này).

## Bước 3. Push code

Code cho Render đã sửa sẵn (một container, `/api/ping`, tắt email, `render.yaml`, workflow chỉ chạy
test). Push theo lệnh Claude đưa. Sau khi push, tab **Actions** trên GitHub chỉ còn 2 job test.

## Bước 4. Tạo web trên Render

Chỉ làm sau khi Bước 2 đã xong: backend gặp database rỗng sẽ tự tạo bảng trống, lúc đó nạp
`neon-seed.sql` sẽ báo trùng bảng (lỡ rồi thì vào Neon xoá database `neondb`, tạo lại cùng tên, làm lại
Bước 2, rồi bấm **Manual Deploy** trên Render).

1. Vào https://render.com, **Sign up** bằng GitHub. Gói Free không tính tiền.
2. **New +** → **Blueprint** → kết nối GitHub, chọn repo `DoanTienTrung/deutschpfad`, nhánh `main`.
   Render đọc `render.yaml` và hiện service `deutschpfad` (Free, Singapore).
3. Render hỏi giá trị các biến bí mật. Lấy từ file `C:\DeutschPfad\.env` ở máy (mở bằng VS Code):

   | Biến | Lấy ở đâu |
   |---|---|
   | `SPRING_DATASOURCE_URL`, `DB_USERNAME`, `DB_PASSWORD` | Bước 1 |
   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `.env` |
   | `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `COHERE_API_KEY` | `.env` |
   | `UNSPLASH_API_KEY`, `DEEPGRAM_API_KEY` | `.env` |

   `JWT_SECRET` Render tự sinh, không cần nhập.
4. Bấm tạo (Apply / Deploy Blueprint). Lần build đầu mất khoảng 10-15 phút, sau đó khởi động khoảng 3
   phút. Xem ở **deutschpfad → Logs**, xong khi thấy dòng `Started BackendApplication`.
5. Ghi lại địa chỉ ở đầu trang service, dạng `https://deutschpfad.onrender.com` (tên bị trùng thì Render
   thêm đuôi, ví dụ `deutschpfad-x1y2.onrender.com`). Dưới đây gọi là `WEB_URL`.

## Bước 5. Cho phép đăng nhập Google ở địa chỉ mới

https://console.cloud.google.com → **APIs & Services** → **Credentials** → bấm vào OAuth client đang dùng:
- **Authorized JavaScript origins**: thêm `WEB_URL`
- **Authorized redirect URIs**: thêm `WEB_URL/login/oauth2/code/google`

**Save**, chờ vài phút. Báo lỗi `redirect_uri_mismatch` thì gửi Claude ảnh chụp (trong đó có địa chỉ
backend thực sự gửi đi).

## Bước 6. Giữ web luôn thức

1. https://uptimerobot.com → **Sign up** (gói Free).
2. **New monitor** → loại **HTTP(s)** → URL: `WEB_URL/api/ping` → interval **5 minutes** → tạo.

`/api/ping` không đụng database nên Neon vẫn ngủ được khi không ai học (chỉ thức khi có người dùng
thật). Không dùng `/api/health` cho việc này: nó mở kết nối DB.

## Bước 7. Kiểm tra

- Mở `WEB_URL`, bấm **Đăng nhập bằng Google** với `trungtiendoan22@gmail.com`.
- Bản sao lưu tháng 7 không có tài khoản admin nào (quyền admin được cấp trên AWS sau đó, mất theo
  database AWS). Cấp lại bằng lệnh dưới, rồi đăng xuất và đăng nhập lại:

  ```powershell
  docker run --rm pgvector/pgvector:pg16 psql "NEON_URL" -c "update users set role = 'ADMIN' where email = 'trungtiendoan22@gmail.com'"
  ```

- Xem từ vựng, ngữ pháp, đọc, nghe đề thi, luyện dịch.
- Đăng ký một tài khoản mới bằng email: phải hiện "Tạo tài khoản thành công" và đăng nhập được ngay.

## Bước 8. Nạp lại nội dung còn thiếu

Đo trên dữ liệu đã nạp (03/11/2026):

| Việc | Hiện có | Làm ở đâu | Thời gian |
|---|---|---|---|
| 1. Nghĩa tiếng Việt câu ví dụ | 7.928/8.128 câu chưa có | Web trên Render | 4 ngày, mỗi ngày 1 lượt |
| 2. Video YouTube | 27 video, 0 kênh | Máy nhà (YouTube chặn IP Render) | vài buổi |
| 3. Kiến thức gia sư | 0 đoạn | Máy nhà (đọc PDF tốn RAM) | 1 buổi |
| 4. Bài tập ngữ pháp | 3 chủ điểm A1 chưa có bài | Web trên Render | 15 phút |

Việc 1, 2 và 4 (nếu dùng AI) cùng ăn quota Groq 200 nghìn token/ngày: hôm nào bấm dịch câu ví dụ thì
đừng chạy nhập video cùng hôm. Thứ tự gợi ý: ngày 1-4 việc 1 (và việc 4), ngày 5 trở đi việc 2, cuối
cùng việc 3 (bước "Đồng bộ từ vựng" cần câu ví dụ đã dịch xong).

Mỗi việc có lệnh kiểm tra (PowerShell, thay `NEON_URL` như ở Bước 2).

### Việc 1. Dịch câu ví dụ từ vựng (trên web)

1. `WEB_URL/admin` → **Từ vựng** → bấm **Dịch các câu còn thiếu**. Mỗi lượt dịch tối đa 2.000 câu (Groq),
   chạy nền (có thể mất vài chục phút), nút hiện "Đang dịch…" cho tới khi xong. Hết quota Groq thì tự dừng.
2. Mỗi ngày bấm một lượt, khoảng 4 ngày. Kiểm tra số câu còn thiếu (về 0 là xong):

   ```powershell
   docker run --rm pgvector/pgvector:pg16 psql "NEON_URL" -c "select count(*) as con_thieu from vocabulary_items where coalesce(example_sentence, '') <> '' and coalesce(example_sentence_vi, '') = ''"
   ```

### Việc 4. Bài tập cho 3 chủ điểm ngữ pháp A1 (trên web)

`WEB_URL/admin` → **Ngữ pháp** → bấm vào chủ điểm → khung **Sinh bài tập hàng loạt**:

| Chủ điểm | Loại | Cách | Mạo từ | Số bài |
|---|---|---|---|---|
| Danh từ và mạo từ ở cách 1 | Mạo từ / biến cách | Nominativ (cách 1) | Mạo từ xác định | 30 |
| Danh từ và mạo từ ở cách 3 | Mạo từ / biến cách | Dativ (cách 3) | Mạo từ xác định | 30 |
| Quy tắc đoán giống danh từ | Mạo từ / biến cách | Nominativ (cách 1) | Mạo từ xác định | 30 |

Bấm **Sinh từ dữ liệu (duyệt sẵn)**: lấy từ bảng giống danh từ có sẵn, không tốn quota AI, bài tập hiện
ngay cho người học. Muốn thêm bài đa dạng hơn thì **✨ AI soạn (chờ duyệt)**, rồi duyệt từng bài.
Kiểm tra (mỗi chủ điểm phải lớn hơn 0):

```powershell
docker run --rm pgvector/pgvector:pg16 psql "NEON_URL" -c "select t.slug, count(e.id) from grammar_topics t left join grammar_exercises e on e.topic_id = t.id where t.slug in ('a1-nomen-artikel-nominativ', 'a1-nomen-artikel-dativ', 'a1-nomen-genusregeln') group by t.slug"
```

### Chuẩn bị chạy ở máy nhà (một lần, cho việc 2 và 3)

1. Thêm 3 dòng vào cuối `C:\DeutschPfad\.env` (lấy từ Bước 1):

   ```
   NEON_JDBC_URL=jdbc:postgresql://ep-ten-gi-do-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   NEON_USER=neondb_owner
   NEON_PASSWORD=MATKHAU
   ```

2. Google Cloud Console → OAuth client: trong **Authorized redirect URIs** phải có
   `http://localhost:8080/login/oauth2/code/google`, trong **Authorized JavaScript origins** có
   `http://localhost:8081` (thường đã có từ hồi chạy local; thiếu thì thêm, **Save**).
3. Cổng 8080 và 8081 phải trống. Project khác đang chiếm thì tắt tạm, ví dụ `docker stop gscores-web`.

### Bật / tắt ở máy nhà

Bật (lần đầu build mất vài phút):

```powershell
cd C:\DeutschPfad
docker compose -f docker-compose.yml -f docker-compose.neon.yml up -d --build backend frontend
docker logs -f deutschpfad-backend
```

Thấy `Started BackendApplication` thì bấm `Ctrl+C` để thoát xem log (backend vẫn chạy). Mở
http://localhost:8081 → **Đăng nhập bằng Google** (cùng tài khoản admin) → http://localhost:8081/admin.
Mọi thứ bấm ở đây ghi thẳng vào Neon, web trên Render thấy ngay.

Tắt khi xong việc (để Neon được ngủ, không tốn giờ compute):

```powershell
docker compose -f docker-compose.yml -f docker-compose.neon.yml stop backend frontend
```

Chỉ bật khi code ở máy giống code đã push (backend này chạy Flyway lên chính database Neon): trước khi
bật, chạy `git pull` nếu vừa sửa code ở chỗ khác.

### Việc 2. Nhập video YouTube (máy nhà)

1. http://localhost:8081/admin → **Bài nghe** → khung nhập video: bấm **Nạp … video vào hàng chờ** (số trên
   nút là số video trong danh sách 89 video chưa có trong database). Việc này cũng tạo danh sách kênh.
2. Bấm **Chạy nhập ngay**. Mỗi lượt lấy phụ đề tối đa 30 video (nghỉ 10 giây giữa các video) và dịch tối
   đa 1.500 câu. Để máy bật tới khi nút hết "Đang chạy...".
3. Còn video chưa xong thì hôm sau (quota Groq mới) bấm **Chạy nhập ngay** tiếp. Video nào báo lỗi có nút
   thử lại.

Kiểm tra (xong khi gần như tất cả là `READY`):

```powershell
docker run --rm pgvector/pgvector:pg16 psql "NEON_URL" -c "select status, count(*) from listening_exercises where kind = 'YOUTUBE' group by status"
```

### Việc 3. Kiến thức gia sư (máy nhà, sau khi việc 1 xong)

1. http://localhost:8081/admin → **Kiến thức Gia sư** → chế độ tải file: chọn `C:\DeutschPfad\A1.pdf`, chọn
   trình độ **A1**, để trống tiêu đề → **Lưu & tạo embedding**. Chờ báo xong rồi làm tiếp `A2.pdf` (A2),
   `B1.pdf` (B1), `B2.pdf` (B2).
2. Bấm **Đồng bộ từ vựng** (đưa 8.128 từ kèm câu ví dụ đã dịch vào kiến thức gia sư; chạy khá lâu vì
   Cohere giới hạn 100 lần gọi/phút).
3. Thử hỏi gia sư trên web Render một câu về ngữ pháp A1.

Kiểm tra (phải lớn hơn 0, sau khi đồng bộ từ vựng thì lên vài nghìn):

```powershell
docker run --rm pgvector/pgvector:pg16 psql "NEON_URL" -c "select count(*) as doan_kien_thuc from tutor_knowledge_chunk"
```

### Không cần nạp lại

IPA từ vựng (đủ), ảnh bìa 45 bài đọc (còn), audio 33 đề nghe Goethe (file nằm ở `bfu.goethe.de`, vẫn tải
được), bộ đệm tra từ (tự sinh lại khi dùng). Mất hẳn, làm lại khi cần: đề nghe Goethe B1 Teil 3-4, B2, C1
và 2 phim Nicos Weg.

## Bước 9 (tuỳ chọn). Bật lại email bằng Brevo

Render free chặn 25/465/587 nhưng không chặn 2525, cổng Brevo cũng nhận.
1. https://www.brevo.com → đăng ký Free (300 thư/ngày) → **Senders, Domains & Dedicated IPs** → thêm và
   xác minh địa chỉ gửi.
2. **SMTP & API** → tạo **SMTP key**.
3. Render → deutschpfad → **Environment**, sửa/thêm rồi **Save** (Render tự deploy lại):

   ```
   MAIL_ENABLED=true
   MAIL_HOST=smtp-relay.brevo.com
   MAIL_PORT=2525
   MAIL_USERNAME=<SMTP login ở trang SMTP của Brevo>
   MAIL_PASSWORD=<SMTP key>
   MAIL_SMTP_AUTH=true
   MAIL_SMTP_STARTTLS=true
   MAIL_FROM=<địa chỉ gửi đã xác minh>
   ```

Gửi từ địa chỉ `@gmail.com` qua Brevo dễ bị đưa vào Spam; có tên miền riêng thì xác minh tên miền trong
Brevo sẽ ổn hơn.

## Bước 10. Duy trì

- **Sao lưu**: Neon Free chỉ giữ lịch sử khôi phục ngắn. Mỗi tuần tải một bản về máy (PowerShell):

  ```powershell
  docker run --rm -v "C:\DeutschPfad:/work" pgvector/pgvector:pg16 pg_dump "NEON_URL" --no-owner --no-privileges -f /work/neon-backup.sql
  ```

  (`*.sql` đã nằm trong `.gitignore`.) Khôi phục: tạo project Neon mới rồi làm như Bước 2 với file này.
- **Theo dõi hạn mức**: Neon → Usage (giờ compute, dung lượng); Render → Billing (giờ chạy, băng thông,
  phút build).
- **Render khởi động lại máy** (Render có thể làm bất cứ lúc nào): web không vào được khoảng 3 phút rồi
  tự lên lại.
- **Xem dữ liệu production**: `docker run --rm pgvector/pgvector:pg16 psql "NEON_URL" -c "select ..."`.

## Số chuẩn sau khi nạp (neon-seed.sql, dựng ngày 03/11/2026)

| Bảng | Số dòng |
|---|---|
| tài khoản (`users`) | 3 |
| từ vựng (`vocabulary_items`) | 8.128 |
| bài học từ vựng (`lessons`) | 168 |
| chủ điểm ngữ pháp (`grammar_topics`) | 77 |
| bài tập ngữ pháp (`grammar_exercises`) | 453 |
| bài nghe (`listening_exercises`) | 60 |
| bài đọc (`reading_passages`) | 45 |
| bộ / câu luyện dịch (`translation_sets` / `translation_items`) | 37 / 370 |
| Flyway mới nhất | 77 |

Lệnh kiểm tra ở Bước 2 phải ra: `tu_vung 8128, ngu_phap 77, luyen_dich 37, flyway 77`.
