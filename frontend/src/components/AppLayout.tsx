import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { getStreak } from '../api/streakApi'
import type { Streak } from '../api/types'

export default function AppLayout() {
  const [streak, setStreak] = useState<Streak | null>(null)

  useEffect(() => {
    getStreak().then(setStreak).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/app" className="font-display text-lg font-bold text-ink">
            DeutschPfad
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/app" className="text-primary hover:text-primary-deep">
              Trang chủ
            </Link>
            <Link to="/app/vocabulary" className="text-primary hover:text-primary-deep">
              Từ vựng
            </Link>
            <Link to="/app/listening" className="text-primary hover:text-primary-deep">
              Nghe
            </Link>
            <Link to="/app/speaking" className="text-primary hover:text-primary-deep">
              Nói
            </Link>
            <Link to="/app/decks" className="text-primary hover:text-primary-deep">
              Bộ từ của tôi
            </Link>
            {streak && (
              <span className="rounded-sm bg-accent/20 px-2 py-1 font-medium text-ink">
                🔥 {streak.currentStreak}
              </span>
            )}
            <Link to="/app/profile" className="text-muted hover:text-ink">
              Hồ sơ
            </Link>
          </nav>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
