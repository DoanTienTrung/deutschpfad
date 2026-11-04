// Hai tuỳ chọn hiển thị trong trang Hồ sơ: giảm chuyển động và tương phản cao. Lưu trong
// localStorage, gắn thành data-motion / data-contrast trên <html> (public/theme-init.js gắn sớm
// trước khi React tải, logic ở đây phải khớp).

export type DisplayPref = 'reduceMotion' | 'highContrast'

const KEYS: Record<DisplayPref, string> = {
  reduceMotion: 'deutschpfad.reduceMotion',
  highContrast: 'deutschpfad.highContrast',
}

export function getDisplayPref(pref: DisplayPref): boolean {
  try {
    return localStorage.getItem(KEYS[pref]) === 'true'
  } catch {
    return false
  }
}

function apply(pref: DisplayPref, on: boolean) {
  const root = document.documentElement
  if (pref === 'reduceMotion') {
    if (on) root.setAttribute('data-motion', 'reduce')
    else root.removeAttribute('data-motion')
  } else {
    if (on) root.setAttribute('data-contrast', 'high')
    else root.removeAttribute('data-contrast')
  }
}

export function setDisplayPref(pref: DisplayPref, on: boolean) {
  try {
    if (on) localStorage.setItem(KEYS[pref], 'true')
    else localStorage.removeItem(KEYS[pref])
  } catch {
    // không lưu được thì vẫn áp dụng cho phiên hiện tại
  }
  apply(pref, on)
}
