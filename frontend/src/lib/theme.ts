// Chế độ sáng/tối. Lưu lựa chọn trong localStorage; "system" đi theo cài đặt của máy và đổi theo
// ngay khi máy đổi. Class "dark" được gắn sớm bởi public/theme-init.js — logic ở đây phải khớp.

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'deutschpfad.theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

export function getThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

export function resolveDark(pref: ThemePreference): boolean {
  return pref === 'dark' || (pref === 'system' && media().matches)
}

export function applyTheme(pref: ThemePreference) {
  const dark = resolveDark(pref)
  document.documentElement.classList.toggle('dark', dark)
  // data-theme cho lớp token mới (src/styles/tokens.css); class "dark" giữ tới khi app chuyển hết sang token.
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

export function setThemePreference(pref: ThemePreference) {
  try {
    if (pref === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, pref)
  } catch {
    // không lưu được thì vẫn áp dụng cho phiên hiện tại
  }
  applyTheme(pref)
}

/** Theo dõi máy đổi sáng/tối khi đang chọn "system". Trả về hàm huỷ theo dõi. */
export function watchSystemTheme(onChange: () => void): () => void {
  const mq = media()
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
