# Dựng lại DeutschPfad trên Oracle Cloud Always Free

> **Phương án dự phòng, hiện KHÔNG dùng.** Đăng ký Oracle bị từ chối (11/2026), production đang chạy
> Render + Neon: xem `ops/render-neon-setup.md`. Giữ file này cho lúc có máy chủ riêng (Oracle, VPS...).
> Lưu ý: workflow GitHub Actions nay chỉ chạy test; các job build image arm64 lên GHCR và deploy qua SSH mà
> mục 0 và 9 nhắc tới phải lấy lại từ lịch sử git của `.github/workflows/deploy.yml` (commit f9ea675).

Hướng dẫn từng bước sau khi tài khoản AWS bị đóng (29/10/2026). Máy mới chạy toàn bộ bằng
`docker-compose.prod.yml`: Postgres (pgvector), backend, frontend (nginx + HTTPS), browser-session, bgutil
và dịch vụ sao lưu database hằng ngày.

Ký hiệu: khối **PowerShell** chạy trên máy Windows của bạn, khối **bash** chạy trên máy chủ sau khi SSH vào.

---

## 0. Trước khi bắt đầu

- [ ] Đã push code có thư mục `ops/` và workflow build ARM, GitHub Actions đã build xong image (bước deploy
      đỏ là bình thường cho tới bước 9).
- [ ] Đổi 2 image sang public: vào `https://github.com/DoanTienTrung?tab=packages` → `deutschpfad-backend`
      → **Package settings** → **Change visibility** → **Public**. Làm tương tự với `deutschpfad-frontend`.
- [ ] Trên máy có: `backup.sql` (thư mục gốc repo), các file `A1.pdf`, `A2.pdf`, `B1.pdf`, `B2.pdf`.
- [ ] Chuẩn bị sẵn giá trị cho `.env` (bước 4): key Groq, Gemini, OpenRouter, Cohere, Deepgram, Unsplash,
      Google OAuth (client id + secret), Gmail + mật khẩu ứng dụng Gmail mới, token DuckDNS.

## 1. Tạo tài khoản và máy chủ Oracle

1. Đăng ký tại `https://www.oracle.com/cloud/free/`. **Home region: Singapore** (không đổi được về sau).
   Oracle giữ tạm khoảng 1 USD trên thẻ để xác minh rồi hoàn lại. **Không** bấm nâng cấp lên Pay As You Go.
2. Tạo SSH key trên máy (**PowerShell**, mỗi dòng một lệnh, Enter khi được hỏi passphrase):
   ```
   ssh-keygen -t ed25519 -f $HOME\.ssh\deutschpfad-oracle -C deutschpfad-oracle
   Get-Content $HOME\.ssh\deutschpfad-oracle.pub
   ```
   Chép dòng in ra (public key) để dán ở bước 4.
3. Mạng: **Networking → Virtual cloud networks → Start VCN Wizard → Create VCN with Internet
   Connectivity**, đặt tên `deutschpfad-vcn`, giữ mặc định, **Create**.
4. Máy: **Compute → Instances → Create instance**:
   - Image: **Canonical Ubuntu 24.04** (bản aarch64 tự chọn theo shape).
   - Shape: **Ampere → VM.Standard.A1.Flex**, **2 OCPU, 12 GB** RAM.
   - Networking: chọn `deutschpfad-vcn`, public subnet, **Assign a public IPv4 address**.
   - SSH keys: **Paste public keys**, dán dòng ở bước 2.
   - Boot volume: **Specify a custom boot volume size** = 100 GB.
   - **Create**. Báo "Out of capacity" thì đổi Availability Domain, thử lại sau vài giờ, hoặc tạm tạo
     1 OCPU / 6 GB.
5. Mở cổng web: **Networking → Virtual cloud networks → deutschpfad-vcn → Security → Default Security List →
   Add Ingress Rules**: Source CIDR `0.0.0.0/0`, IP Protocol TCP, Destination Port `80`. Thêm rule thứ hai
   giống vậy với cổng `443`.
6. Ghi lại **Public IP** của máy (trang chi tiết instance).

## 2. Cài đặt máy chủ

Đăng nhập (**PowerShell**, thay `<IP>`):
```
ssh -i $HOME\.ssh\deutschpfad-oracle ubuntu@<IP>
```

Trên máy chủ (**bash**), chạy lần lượt:
```bash
sudo apt-get update && sudo apt-get -y upgrade
sudo timedatectl set-timezone Asia/Ho_Chi_Minh

# Tường lửa trong Ubuntu của Oracle chặn sẵn mọi cổng trừ 22. Mở 80/443 TRƯỚC rule REJECT rồi lưu lại.
# Làm trước khi cài Docker để file lưu rule không dính rule của Docker.
N=$(sudo iptables -L INPUT --line-numbers | awk '/REJECT/ {print $1; exit}')
sudo iptables -I INPUT "$N" -p tcp -m state --state NEW --dport 443 -j ACCEPT
sudo iptables -I INPUT "$N" -p tcp -m state --state NEW --dport 80 -j ACCEPT
sudo netfilter-persistent save

# Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit
```
Đăng nhập lại (để nhóm docker có hiệu lực) rồi tải code:
```bash
git clone https://github.com/DoanTienTrung/deutschpfad.git ~/deutschpfad
cd ~/deutschpfad
docker version --format '{{.Server.Arch}}'   # phải in ra arm64
```

## 3. Trỏ tên miền về máy mới

1. Vào `https://www.duckdns.org`, đăng nhập, ô **current ip** của `deutschpfad` sửa thành IP mới → **update ip**.
   Chép **token** ở đầu trang để dùng cho `.env`.
2. Kiểm tra từ máy bạn (**PowerShell**): `nslookup deutschpfad.duckdns.org` phải ra IP mới (thường dưới 1 phút).

## 4. Tạo file `.env`

```bash
cd ~/deutschpfad
cp .env.example .env
chmod 600 .env
openssl rand -base64 48   # chạy 2 lần: một giá trị cho POSTGRES_PASSWORD, một cho JWT_SECRET
nano .env
```
Điền (giữ nguyên các dòng không nhắc tới):

| Biến | Giá trị |
|---|---|
| `POSTGRES_USER` / `POSTGRES_DB` | `deutschpfad` |
| `POSTGRES_PASSWORD` | chuỗi ngẫu nhiên thứ nhất |
| `JWT_SECRET` | chuỗi ngẫu nhiên thứ hai |
| `FRONTEND_URL` | `https://deutschpfad.duckdns.org` |
| `MAIL_HOST` / `MAIL_PORT` | `smtp.gmail.com` / `587` |
| `MAIL_SMTP_AUTH` / `MAIL_SMTP_STARTTLS` | `true` / `true` |
| `MAIL_USERNAME` = `MAIL_FROM` | địa chỉ Gmail gửi thư |
| `MAIL_PASSWORD` | mật khẩu ứng dụng Gmail (Google Account → Security → App passwords) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | như cũ (Google Cloud Console → Credentials) |
| `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY` | **bắt buộc**: thiếu Gemini key là backend không khởi động |
| `COHERE_API_KEY`, `DEEPGRAM_API_KEY`, `UNSPLASH_API_KEY` | lấy lại ở trang quản lý của từng dịch vụ |
| `DUCKDNS_TOKEN` | token ở bước 3 |
| `VITE_API_ORIGIN` | xoá giá trị (để trống) |

Lưu: `Ctrl+O`, Enter, `Ctrl+X`.

## 5. Đưa dữ liệu lên máy

Trên máy bạn (**PowerShell**, ở thư mục `C:\DeutschPfad`, thay `<IP>`):
```
scp -i $HOME\.ssh\deutschpfad-oracle backup.sql ubuntu@<IP>:/home/ubuntu/deutschpfad/backup.sql
```
`backup.sql` có email và hash mật khẩu: sẽ xoá khỏi máy chủ ở bước 7.

Cookies YouTube (dùng ở bước 10) chưa có thì tạo file rỗng, **bắt buộc trước khi bật hệ thống** (không có
file, Docker sẽ tạo nhầm một thư mục tên `cookies.txt`):
```bash
cd ~/deutschpfad && touch cookies.txt
```

## 6. Khôi phục database

```bash
cd ~/deutschpfad
bash ops/restore-from-backup.sh backup.sql
```
Bảng số liệu cuối phải khớp (đã chạy thử ở máy local ngày 03/11/2026):

| bảng | số dòng |
|---|---|
| tài khoản | 3 |
| từ vựng | 7928 |
| bài học từ vựng | 160 |
| bài nghe | 60 |
| câu nghe | 5038 |
| bài đọc | 45 |
| câu hỏi đọc | 295 |
| đề luyện nói | 1 |
| flyway mới nhất | 37 |

Script tự dừng nếu database đã có bảng (không ghi đè). Muốn làm lại từ đầu: `docker compose -f
docker-compose.prod.yml down -v` (xoá cả dữ liệu) rồi chạy lại.

## 7. HTTPS và bật toàn bộ hệ thống

Cấp chứng chỉ lần đầu (cổng 80 còn trống, tên miền đã trỏ đúng ở bước 3; thay email):
```bash
cd ~/deutschpfad
mkdir -p certbot-etc certbot-webroot backups
docker run --rm -p 80:80 -v "$PWD/certbot-etc:/etc/letsencrypt" certbot/certbot certonly --standalone \
  -d deutschpfad.duckdns.org --email <gmail-của-bạn> --agree-tos --no-eff-email
```
Bật hệ thống (lần đầu build thêm browser-session, mất vài phút):
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f backend   # chờ dòng "Started BackendApplication", Ctrl+C để thoát
```
Kiểm tra migration và số liệu (backend đã chạy V38-V77):
```bash
cd ~/deutschpfad
PGU=$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2-); PGD=$(grep -E '^POSTGRES_DB=' .env | cut -d= -f2-)
docker compose -f docker-compose.prod.yml exec postgres psql -U "$PGU" -d "$PGD" -c "select max(version::int) as phien_ban, bool_and(success) as thanh_cong from flyway_schema_history;"
docker compose -f docker-compose.prod.yml exec postgres psql -U "$PGU" -d "$PGD" -c "select source, count(*) from vocabulary_items group by 1 order by 1;"
docker compose -f docker-compose.prod.yml exec postgres psql -U "$PGU" -d "$PGD" -c "select (select count(*) from grammar_topics) as chu_diem, (select count(*) from grammar_exercises) as bai_tap, (select count(*) from translation_items) as cau_dich, (select count(*) from lessons) as bai_hoc;"
```
Kết quả đúng: `phien_ban` 77, `thanh_cong` t; từ vựng FREQUENCY 5015, GOETHE 2913, LIFE 200; chủ điểm 77,
bài tập 453, câu dịch 370, bài học 168.

Mở `https://deutschpfad.duckdns.org`, đăng nhập bằng tài khoản admin cũ (`trungtiendoan22@gmail.com`, mật
khẩu cũ). Ổn rồi thì xoá bản dữ liệu tháng 7:
```bash
rm ~/deutschpfad/backup.sql
```

## 8. Việc chạy định kỳ (cron)

```bash
(crontab -l 2>/dev/null; \
 echo "*/5 * * * * bash /home/ubuntu/deutschpfad/ops/duckdns-update.sh >/dev/null 2>&1"; \
 echo "17 3,15 * * * bash /home/ubuntu/deutschpfad/ops/renew-cert.sh >> /home/ubuntu/renew-cert.log 2>&1") | crontab -
crontab -l
```
Sao lưu database đã tự chạy trong container `db-backup` (mỗi 24 giờ, giữ 7 ngày, `~/deutschpfad/backups/`).

## 9. Deploy tự động từ GitHub

GitHub → repo → **Settings → Secrets and variables → Actions**, sửa 2 secret:
- `EC2_HOST` = IP máy Oracle.
- `EC2_SSH_KEY` = toàn bộ nội dung file private key (**PowerShell**: `Get-Content $HOME\.ssh\deutschpfad-oracle`),
  dán cả dòng `-----BEGIN ...` và `-----END ...`.

Rồi vào **Actions → lượt chạy gần nhất → Re-run all jobs** (hoặc push một commit). Cả 5 job phải xanh.

## 10. Cookies YouTube (cho job nhập video luyện nghe)

1. Trên trình duyệt đang đăng nhập YouTube, dùng tiện ích "Get cookies.txt LOCALLY" xuất cookies của
   `youtube.com` và `google.com` thành `cookies.txt`.
2. Đưa lên máy (**PowerShell**, ở thư mục chứa file):
   ```
   scp -i $HOME\.ssh\deutschpfad-oracle cookies.txt ubuntu@<IP>:/home/ubuntu/deutschpfad/cookies.txt
   ```
3. Nạp vào trình duyệt chạy nền (**bash**, theo `browser-session/README.md`):
   ```bash
   cd ~/deutschpfad
   docker compose -f docker-compose.prod.yml stop browser-session
   docker compose -f docker-compose.prod.yml run --rm -v "$PWD/cookies.txt:/tmp/cookies.txt:ro" browser-session node import-cookies.js /tmp/cookies.txt
   docker compose -f docker-compose.prod.yml start browser-session
   docker compose -f docker-compose.prod.yml restart backend
   ```

## 11. Nạp lại nội dung còn thiếu (trong trang admin, chạy nền khoảng 1 tuần)

Cùng dùng quota Groq nên làm theo thứ tự:
1. **Admin → Từ vựng → "Dịch các câu còn thiếu"**: mỗi ngày bấm một lần (khoảng 7.900 câu, 2.000 câu/lượt,
   tức 4 ngày). Tự dừng khi hết quota.
2. Dịch xong: **Admin → Bài nghe → "Nạp 89 video vào hàng chờ"**. Job chạy 02:00 mỗi đêm, khoảng 5 đêm.
   Job này cũng tự gắn kênh và thời lượng cho các video cũ.
3. **Admin → Kiến thức Gia sư**: tải lên `A1.pdf`, `A2.pdf`, `B1.pdf`, `B2.pdf`, sau đó bấm **"Đồng bộ từ vựng"**.
4. **Admin → Ngữ pháp → "Sinh bài tập hàng loạt"** (sinh theo quy tắc, không tốn AI) cho 5 chủ điểm từng
   có loại bài này: `a1-verb-konjugation` (Chia động từ, 50 câu), `a1-nomen-artikel-nominativ`,
   `a1-nomen-artikel-akkusativ`, `a1-nomen-artikel-dativ` (Mạo từ / biến cách, mỗi chủ điểm 10 câu, chọn đúng
   cách), `a1-nomen-genusregeln` (Mạo từ, 12 câu). 453 bài từ migration vẫn đủ cho mọi chủ điểm, đây chỉ là
   phần bổ sung.
5. Tuỳ chọn: **Admin → Luyện dịch** soạn câu cho B1-B2 (AI soạn rồi duyệt kỹ).

Không khôi phục được (làm lại nếu cần): bài nghe đề Goethe B1 Teil 3-4, B2, C1; 2 phim dài Nicos Weg; bộ từ
Menschen A1 (đang ẩn); chỉnh sửa tay trên production sau 19/07.

## 12. Duy trì

**Mỗi tuần tải bản sao lưu về máy** (**PowerShell**): Oracle mà khoá tài khoản thì bản trên máy chủ mất theo.
```
scp -i $HOME\.ssh\deutschpfad-oracle ubuntu@deutschpfad.duckdns.org:/home/ubuntu/deutschpfad/backups/latest.sql.gz "$HOME\Documents\deutschpfad-backup-$(Get-Date -Format yyyy-MM-dd).sql.gz"
```

**Oracle tắt máy vì "nhàn rỗi"** (máy miễn phí dùng rất ít trong 7 ngày): dữ liệu vẫn còn, vào Console →
Instances → **Start**. IP có thể đổi: cron DuckDNS tự cập nhật, chỉ cần sửa secret `EC2_HOST` trên GitHub.

**Dựng lại từ bản sao lưu hằng ngày** (máy mới, sau bước 1-5, thay cho bước 6):
```bash
cd ~/deutschpfad
docker compose -f docker-compose.prod.yml up -d postgres
PGU=$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2-); PGD=$(grep -E '^POSTGRES_DB=' .env | cut -d= -f2-)
gunzip -c latest.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -v ON_ERROR_STOP=1 -U "$PGU" -d "$PGD"
```
Bản sao lưu hằng ngày là bản đầy đủ (cả bảng lẫn dữ liệu, kể cả lịch sử migration), nạp xong là bật hệ thống
được ngay (bước 7).
