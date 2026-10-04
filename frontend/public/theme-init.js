// Chạy TRƯỚC khi React tải (nạp đồng bộ trong <head>) để gắn class "dark" ngay từ khung hình đầu —
// nếu đợi React thì trang nháy sáng rồi mới tối. Logic phải khớp với src/lib/theme.ts.
(function () {
  try {
    var pref = localStorage.getItem('deutschpfad.theme') || 'system'
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (dark) document.documentElement.classList.add('dark')
  } catch (e) {
    // localStorage bị chặn (chế độ riêng tư…) → giữ chế độ sáng
  }
})()
