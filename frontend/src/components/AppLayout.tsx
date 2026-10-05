import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { getStreak } from '../api/streakApi'
import { getVocabularyStats } from '../api/vocabularyApi'
import type { Streak } from '../api/types'
import { StudyTimeProvider, useStudyTime } from '../context/StudyTimeContext'
import { formatStudyTimeClock } from '../lib/studyTime'
import { useAuth } from '../context/AuthContext'
import { applyTheme, getThemePreference, setThemePreference, watchSystemTheme, type ThemePreference } from '../lib/theme'
import TutorChatWidget from './TutorChatWidget'

// Simple 18px stroke icons keep the sidebar scannable without pulling in an icon library.
const NAV_ICONS: Record<string, React.ReactNode> = {
  home: (
    <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />
  ),
  book: (
    <path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Zm0 0A2.5 2.5 0 0 0 6.5 22H20v-3M9 7h8M9 11h5" />
  ),
  headphones: (
    <path d="M4 13a8 8 0 0 1 16 0M4 13v5a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Zm16 0v5a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z" />
  ),
  mic: (
    <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm6-4a6 6 0 0 1-12 0M12 17v4m-3 0h6" />
  ),
  reading: (
    <path d="M12 6.5C10.5 5 8.5 4 6 4H3v15h3c2.5 0 4.5 1 6 2.5 1.5-1.5 3.5-2.5 6-2.5h3V4h-3c-2.5 0-4.5 1-6 2.5Zm0 0V21" />
  ),
  // Thước kẻ eke — ngữ pháp là bộ "quy tắc dựng câu", nên hình thước hợp hơn biểu tượng sách
  // (đã dùng cho Từ vựng).
  grammar: (
    <path d="M4 20 20 4M6.5 20H4v-2.5L17.5 4H20v2.5L6.5 20ZM9 13l2 2m2-5 2 2" />
  ),
  // Bút: phần Viết (luyện dịch, luyện viết).
  writing: (
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Zm9.5-13.5 4 4" />
  ),
  layers: (
    <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5" />
  ),
  user: (
    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 10a8 8 0 0 1 16 0" />
  ),
  // Hai mũi tên vòng — ôn lại theo lịch.
  review: (
    <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8m0-4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16m0 4v-4h-4" />
  ),
  sun: (
    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-14v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  ),
  moon: (
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  ),
  monitor: (
    <path d="M4 4h16v11H4V4Zm4 16h8m-4-5v5" />
  ),
  collapse: (
    <path d="M15 6l-6 6 6 6" />
  ),
  expand: (
    <path d="M9 6l6 6-6 6" />
  ),
}

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {NAV_ICONS[name]}
    </svg>
  )
}

function BreakReminderBanner() {
  const { breakReminderMessage, dismissBreakReminder } = useStudyTime()
  const { user } = useAuth()

  if (!breakReminderMessage) return null

  const name = user?.fullName?.trim() || 'Bạn'

  return (
    <div className="relative flex items-center overflow-hidden bg-accent px-4 py-2 text-ink shadow-floating">
      <div className="relative h-5 min-w-0 flex-1 overflow-hidden">
        <p className="break-reminder-track text-sm font-medium">
          {name} {breakReminderMessage}
        </p>
      </div>
      <button
        onClick={dismissBreakReminder}
        aria-label="Đóng nhắc nhở"
        className="ml-3 shrink-0 rounded-sm p-1 text-ink/70 hover:text-ink"
      >
        ✕
      </button>
    </div>
  )
}

function StreakBadge({ streak }: { streak: Streak }) {
  const [bump, setBump] = useState(false)
  const prevRef = useRef<number | null>(null)

  useEffect(() => {
    const increased = prevRef.current !== null && streak.currentStreak > prevRef.current
    prevRef.current = streak.currentStreak
    if (increased) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 400)
      return () => clearTimeout(t)
    }
  }, [streak.currentStreak])

  // DESIGN.md's signature component: the one earned-amber pill allowed in the app chrome.
  return (
    <span
      title={`Chuỗi ${streak.currentStreak} ngày học liên tiếp`}
      className={`shrink-0 rounded-full bg-accent px-2.5 py-1 text-sm font-semibold text-ink ${bump ? 'streak-bump' : ''}`}
    >
      🔥 {streak.currentStreak}
    </span>
  )
}

function StudyTimeBadge() {
  const { todaySeconds } = useStudyTime()
  return (
    <span className="shrink-0 text-sm font-medium tabular-nums text-muted" title="Thời gian học hôm nay">
      ⏱ {formatStudyTimeClock(todaySeconds)}
    </span>
  )
}

type NavItem = { to: string; label: string; icon: string; end?: boolean; badge?: number }

function SidebarLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const badge = item.badge && item.badge > 0 ? (item.badge > 99 ? '99+' : String(item.badge)) : null
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? (badge ? `${item.label} (${badge})` : item.label) : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors ${
          collapsed ? 'justify-center px-0' : 'px-3'
        } ${isActive ? 'bg-primary/12 text-primary-deep' : 'text-ink hover:bg-canvas hover:text-primary'}`
      }
    >
      <NavIcon name={item.icon} />
      {collapsed ? (
        <span className="sr-only">{item.label}</span>
      ) : (
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      )}
      {badge &&
        (collapsed ? (
          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
        ) : (
          <span className="rounded-full bg-danger-bg px-2 py-0.5 text-xs font-semibold tabular-nums text-danger">
            {badge}
          </span>
        ))}
    </NavLink>
  )
}

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'light', label: 'Sáng', icon: 'sun' },
  { value: 'dark', label: 'Tối', icon: 'moon' },
  { value: 'system', label: 'Theo máy', icon: 'monitor' },
]

function ThemeSwitcher({ collapsed }: { collapsed: boolean }) {
  const [pref, setPref] = useState<ThemePreference>(() => getThemePreference())

  // "Theo máy": đổi theo ngay khi hệ điều hành chuyển sáng/tối (vd. tự động theo giờ).
  useEffect(() => {
    if (pref !== 'system') return
    return watchSystemTheme(() => applyTheme('system'))
  }, [pref])

  function choose(next: ThemePreference) {
    setPref(next)
    setThemePreference(next)
  }

  if (collapsed) {
    const index = THEME_OPTIONS.findIndex((o) => o.value === pref)
    const next = THEME_OPTIONS[(index + 1) % THEME_OPTIONS.length]
    return (
      <button
        onClick={() => choose(next.value)}
        title={`Giao diện: ${THEME_OPTIONS[index].label} - bấm để đổi sang ${next.label}`}
        aria-label={`Đổi giao diện sang ${next.label}`}
        className="flex w-full justify-center rounded-md py-2 text-muted hover:bg-canvas hover:text-ink"
      >
        <NavIcon name={THEME_OPTIONS[index].icon} />
      </button>
    )
  }

  // Chỉ icon (tên ở title/aria-label): 3 nhãn chữ không vừa bề rộng sidebar, "Theo máy" bị xuống dòng.
  return (
    <div className="flex items-center justify-between gap-2 px-3">
      <span className="text-sm text-muted">Giao diện</span>
      <div role="radiogroup" aria-label="Giao diện" className="flex gap-0.5 rounded-md bg-canvas p-0.5">
        {THEME_OPTIONS.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={pref === o.value}
            aria-label={o.label}
            title={o.label}
            onClick={() => choose(o.value)}
            className={`rounded-sm p-1.5 transition-colors ${
              pref === o.value ? 'bg-card text-ink shadow-lifted' : 'text-muted hover:text-ink'
            }`}
          >
            <NavIcon name={o.icon} />
          </button>
        ))}
      </div>
    </div>
  )
}

function SidebarContent({
  collapsed,
  streak,
  dueCount,
  onNavigate,
  onToggleCollapse,
}: {
  collapsed: boolean
  streak: Streak | null
  dueCount: number
  onNavigate?: () => void
  onToggleCollapse?: () => void
}) {
  const { user } = useAuth()
  const learn: NavItem[] = [
    { to: '/app', label: 'Trang chủ', icon: 'home', end: true },
    { to: '/app/review', label: 'Ôn tập', icon: 'review', badge: dueCount },
    { to: '/app/vocabulary', label: 'Từ vựng', icon: 'book' },
    { to: '/app/listening', label: 'Nghe', icon: 'headphones' },
    { to: '/app/speaking', label: 'Nói', icon: 'mic' },
    { to: '/app/reading', label: 'Đọc', icon: 'reading' },
    { to: '/app/writing', label: 'Viết', icon: 'writing' },
    { to: '/app/grammar', label: 'Ngữ pháp', icon: 'grammar' },
  ]
  const personal: NavItem[] = [{ to: '/app/decks', label: 'Bộ từ của tôi', icon: 'layers' }]
  const groupLabel = 'mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-muted'

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 shrink-0 items-center ${collapsed ? 'justify-center' : 'px-6'}`}>
        <Link to="/app" onClick={onNavigate} className="font-display text-lg font-bold text-ink" title="DeutschPfad">
          {collapsed ? (
            <span aria-label="DeutschPfad">
              D<span className="text-accent-deep">P</span>
            </span>
          ) : (
            <>
              Deutsch<span className="text-accent-deep">Pfad</span>
            </>
          )}
        </Link>
      </div>

      <nav aria-label="Điều hướng chính" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {!collapsed && <p className={`${groupLabel} mt-1`}>Học</p>}
        <div className="space-y-0.5">
          {learn.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
        {collapsed ? <div className="mx-2 my-3 border-t border-hairline" /> : <p className={groupLabel}>Cá nhân</p>}
        <div className="space-y-0.5">
          {personal.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="shrink-0 space-y-2 border-t border-hairline px-3 py-3">
        {collapsed ? (
          streak && (
            <div className="flex justify-center">
              <StreakBadge streak={streak} />
            </div>
          )
        ) : (
          <div className="flex items-center justify-between gap-2 px-1">
            {streak ? <StreakBadge streak={streak} /> : <span />}
            <StudyTimeBadge />
          </div>
        )}

        <SidebarLink
          item={{ to: '/app/profile', label: user?.fullName?.trim() || 'Hồ sơ', icon: 'user' }}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

        <ThemeSwitcher collapsed={collapsed} />

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            className={`flex w-full items-center gap-3 rounded-md py-2 text-sm text-muted hover:bg-canvas hover:text-ink ${
              collapsed ? 'justify-center' : 'px-3'
            }`}
          >
            <NavIcon name={collapsed ? 'expand' : 'collapse'} />
            {!collapsed && 'Thu gọn'}
          </button>
        )}
      </div>
    </div>
  )
}

const COLLAPSED_STORAGE_KEY = 'deutschpfad.sidebarCollapsed'

// Trang luyện tập có cột riêng (danh sách chế độ, danh sách câu) — để sidebar mở đầy đủ thì thành 3
// cột, nội dung chính bị ép hẹp. Ở các trang này sidebar tự thu thành dải icon; người dùng vẫn mở
// rộng được, và lựa chọn đó chỉ giữ tới khi rời trang.
const FOCUS_ROUTE =
  /^\/app\/(practice\/[^/]+|decks\/[^/]+\/practice|listening\/(?!mine(\/|$))[^/]+|reading\/(?!articles$|mine$)[^/]+)$/

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function AppLayout() {
  const location = useLocation()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [collapsedPref, setCollapsedPref] = useState(readCollapsed)
  const [expandedOnFocusRoute, setExpandedOnFocusRoute] = useState<string | null>(null)
  const [drawerPath, setDrawerPath] = useState<string | null>(null)

  const onFocusRoute = FOCUS_ROUTE.test(location.pathname)
  const collapsed = onFocusRoute ? expandedOnFocusRoute !== location.pathname : collapsedPref
  // Ngăn kéo gắn với trang lúc mở: điều hướng sang trang khác (kể cả nút Back) là tự đóng.
  const drawerOpen = drawerPath === location.pathname

  useEffect(() => {
    getStreak().then(setStreak).catch(() => {})
  }, [])

  // Số thẻ đến hạn trên mục "Ôn tập": lấy lại mỗi lần đổi trang, để sau một phiên ôn con số giảm ngay.
  useEffect(() => {
    getVocabularyStats()
      .then((stats) => setDueCount(stats.dueForReview))
      .catch(() => {})
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerPath(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  function toggleCollapse() {
    if (onFocusRoute) {
      setExpandedOnFocusRoute(collapsed ? location.pathname : null)
      return
    }
    const next = !collapsedPref
    setCollapsedPref(next)
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next))
    } catch {
      // không lưu được thì chỉ áp dụng cho phiên này
    }
  }

  return (
    <StudyTimeProvider>
      <div className="min-h-screen bg-canvas md:flex">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 border-r border-hairline bg-surface transition-[width] duration-200 md:block ${
            collapsed ? 'w-16' : 'w-60'
          }`}
        >
          <SidebarContent collapsed={collapsed} streak={streak} dueCount={dueCount} onToggleCollapse={toggleCollapse} />
        </aside>

        {/* Điện thoại: thanh trên mỏng + ngăn kéo trượt từ trái (không đủ chỗ cho sidebar cố định). */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-surface px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerPath(location.pathname)}
              aria-label="Mở menu"
              aria-expanded={drawerOpen}
              className="rounded-sm p-1.5 text-ink hover:bg-canvas"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <Link to="/app" className="font-display text-lg font-bold text-ink">
              Deutsch<span className="text-accent-deep">Pfad</span>
            </Link>
          </div>
          {streak && <StreakBadge streak={streak} />}
        </header>

        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerPath(null)} />
            <div className="relative z-50 h-full w-64 bg-surface shadow-floating">
              <SidebarContent
                collapsed={false}
                streak={streak}
                dueCount={dueCount}
                onNavigate={() => setDrawerPath(null)}
              />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <BreakReminderBanner />
          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
        <TutorChatWidget />
      </div>
    </StudyTimeProvider>
  )
}
