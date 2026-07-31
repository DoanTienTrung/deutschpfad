# fetch-transcript

Lấy phụ đề tiếng Đức của 1 video YouTube từ **máy bạn** (không phải server) — vì IP nhà không bị
YouTube chặn như IP datacenter của server production, nên không cần cookie/đăng nhập gì cả.

## Dùng

```powershell
cd fetch-transcript
.\fetch-transcript.ps1 https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

(hoặc chỉ dán video ID: `.\fetch-transcript.ps1 dQw4w9WgXcQ`)

Script tự tải phụ đề tiếng Đức bằng `yt-dlp` (cần cài sẵn: `pip install yt-dlp`) và **copy thẳng
vào clipboard**. Sau đó:

1. Mở Admin → Sửa/Tạo bài nghe (hoặc trang "Video của tôi")
2. Dán link video vào ô video
3. Dán (Ctrl+V) nội dung vừa copy vào ô "Dán transcript"
4. Lưu

Backend đã tự nhận diện nội dung dán vào là file phụ đề VTT thô và parse y hệt như khi auto-fetch
thành công (xem `TranscriptParser.java`) — không cần chỉnh sửa gì thêm trước khi dán.

## Vì sao cần cái này

Từ ~giữa tháng 7/2026, YouTube bắt đầu chặn các yêu cầu tự động từ IP datacenter (bao gồm EC2 của
server production) bằng "Sign in to confirm you're not a bot". Đã thử PO-token, cookie tĩnh, và
browser session tự làm mới (xem `browser-session/`) — cả ba đều bị Google vô hiệu hoá lại trong
vài phút đến vài giờ. IP nhà không bị chặn nên đây là cách đáng tin cậy nhất hiện tại, đổi lại
không còn "dán link là xong" tự động 100% như trước — cần chạy script này 1 lần mỗi video mới.
