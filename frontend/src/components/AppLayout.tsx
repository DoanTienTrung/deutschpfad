import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { getStreak } from '../api/streakApi'
import type { Streak } from '../api/types'
import { StudyTimeProvider, useStudyTime } from '../context/StudyTimeContext'
import { formatStudyTimeClock } from '../lib/studyTime'
import { useAuth } from '../context/AuthContext'

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
  layers: (
    <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5" />
  ),
  user: (
    <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 10a8 8 0 0 1 16 0" />
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

const NAV_ITEMS = [
  { to: '/app', label: 'Trang chủ', icon: 'home', end: true },
  { to: '/app/vocabulary', label: 'Từ vựng', icon: 'book', end: false },
  { to: '/app/listening', label: 'Nghe', icon: 'headphones', end: false },
  { to: '/app/speaking', label: 'Nói', icon: 'mic', end: false },
  { to: '/app/reading', label: 'Đọc', icon: 'reading', end: false },
]

// Header-only on desktop (there's room); folded into the mobile drawer nav since the header row
// on a narrow phone doesn't have space for the hamburger, logo, streak badge, AND these two links.
const HEADER_LINKS = [
  { to: '/app/decks', label: 'Bộ từ của tôi', icon: 'layers' },
  { to: '/app/profile', label: 'Hồ sơ', icon: 'user' },
]

const SIDEBAR_STORAGE_KEY = 'deutschpfad.sidebarOpen'

function NavLinks({ onNavigate, includeHeaderLinks = false }: { onNavigate?: () => void; includeHeaderLinks?: boolean }) {
  const items = includeHeaderLinks ? [...NAV_ITEMS, ...HEADER_LINKS.map((l) => ({ ...l, end: false }))] : NAV_ITEMS
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/12 text-primary-deep'
                : 'text-ink hover:bg-surface hover:text-primary'
            }`
          }
        >
          <NavIcon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </>
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

  // DESIGN.md's signature component: the one earned-amber pill allowed in the header chrome.
  return (
    <span className={`shrink-0 rounded-full bg-accent px-2.5 py-1 font-semibold text-ink ${bump ? 'streak-bump' : ''}`}>
      🔥 {streak.currentStreak}
    </span>
  )
}

function StudyTimeBadge() {
  const { todaySeconds } = useStudyTime()
  return (
    <span
      className="hidden shrink-0 items-center gap-1 rounded-full border border-hairline bg-canvas px-2.5 py-1 font-medium tabular-nums text-muted sm:flex"
      title="Thời gian học hôm nay"
    >
      ⏱ {formatStudyTimeClock(todaySeconds)}
    </span>
  )
}

export default function AppLayout() {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false')

  useEffect(() => {
    getStreak().then(setStreak).catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen))
  }, [sidebarOpen])

  return (
    <StudyTimeProvider>
    <div className="min-h-screen bg-canvas">
      {/* Hairline border per DESIGN.md's nav spec -- an amber border here would put the accent on
          static chrome, which The One Warm Color Rule reserves for earned moments only. */}
      <header className="flex items-center justify-between border-b border-hairline bg-surface px-6 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Thu gọn menu' : 'Mở rộng menu'}
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
        <div className="flex items-center gap-3 text-sm sm:gap-5">
          {streak && <StreakBadge streak={streak} />}
          <StudyTimeBadge />
          <Link to="/app/decks" className="hidden text-muted hover:text-ink sm:inline">
            Bộ từ của tôi
          </Link>
          <Link to="/app/profile" className="hidden text-muted hover:text-ink sm:inline">
            Hồ sơ
          </Link>
        </div>
      </header>

      <BreakReminderBanner />

      {/* Mobile nav: sidebarOpen renders a full-screen overlay drawer instead of pushing content,
          since there's no room to squeeze a persistent sidebar next to the page on narrow screens.
          Also folds in "Bộ từ của tôi"/"Hồ sơ" (hidden from the header on mobile above). */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <nav className="relative z-50 h-full w-56 space-y-1 overflow-y-auto bg-surface p-4 shadow-lifted">
            <NavLinks onNavigate={() => setSidebarOpen(false)} includeHeaderLinks />
          </nav>
        </div>
      )}

      <div className="flex items-start">
        <aside
          aria-hidden={!sidebarOpen}
          className={`sticky top-0 hidden shrink-0 self-start overflow-hidden border-hairline transition-[width] duration-200 sm:block ${
            sidebarOpen ? 'w-56 border-r px-3 py-6' : 'w-0'
          }`}
        >
          <nav className="w-56 space-y-1">
            <NavLinks />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </StudyTimeProvider>
  )
}
