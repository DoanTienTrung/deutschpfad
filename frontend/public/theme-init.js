// Chạy TRƯỚC khi React tải (nạp đồng bộ trong <head>) để gắn chế độ tối ngay từ khung hình đầu —
// nếu đợi React thì trang nháy sáng rồi mới tối. Logic phải khớp với src/lib/theme.ts.
(function () {
  try {
    var pref = localStorage.getItem('deutschpfad.theme') || 'system'
    var dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (dark) document.documentElement.classList.add('dark')
    // data-theme cho lớp token mới (src/styles/tokens.css); class "dark" giữ tới khi app chuyển hết sang token.
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    // Giảm chuyển động / tương phản cao (src/lib/displayPrefs.ts).
    if (localStorage.getItem('deutschpfad.reduceMotion') === 'true') document.documentElement.setAttribute('data-motion', 'reduce')
    if (localStorage.getItem('deutschpfad.highContrast') === 'true') document.documentElement.setAttribute('data-contrast', 'high')
  } catch (e) {
    // localStorage bị chặn (chế độ riêng tư…) → giữ chế độ sáng
  }
})()
