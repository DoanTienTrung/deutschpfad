import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { getStreak } from '../api/streakApi'
import type { Streak } from '../api/types'

const NAV_ITEMS = [
  { to: '/app', label: 'Trang chủ', end: true },
  { to: '/app/vocabulary', label: 'Từ vựng', end: false },
  { to: '/app/listening', label: 'Nghe', end: false },
  { to: '/app/speaking', label: 'Nói', end: false },
  { to: '/app/reading', label: 'Đọc', end: false },
]

// Header-only on desktop (there's room); folded into the mobile drawer nav since the header row
// on a narrow phone doesn't have space for the hamburger, logo, streak badge, AND these two links.
const HEADER_LINKS = [
  { to: '/app/decks', label: 'Bộ từ của tôi' },
  { to: '/app/profile', label: 'Hồ sơ' },
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
            `block rounded-sm px-3 py-2 text-sm font-medium ${
              isActive
                ? 'bg-accent/15 text-accent-deep'
                : 'text-ink hover:bg-surface hover:text-accent-deep'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
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
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between border-b-2 border-accent/50 bg-surface px-6 py-4">
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
          {streak && (
            <span className="shrink-0 rounded-sm bg-accent/20 px-2 py-1 font-medium text-ink">
              🔥 {streak.currentStreak}
            </span>
          )}
          <Link to="/app/decks" className="hidden text-muted hover:text-ink sm:inline">
            Bộ từ của tôi
          </Link>
          <Link to="/app/profile" className="hidden text-muted hover:text-ink sm:inline">
            Hồ sơ
          </Link>
        </div>
      </header>

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
  )
}
