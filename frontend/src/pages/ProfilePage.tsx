import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStreak } from '../api/streakApi'
import { getProgressSummary, getHeatmap } from '../api/progressApi'
import type { Streak, ProgressSummary, HeatmapDay } from '../api/types'
import ContributionHeatmap from '../components/progress/ContributionHeatmap'
import ProgressBars from '../components/progress/ProgressBars'

export default function ProfilePage() {
  const { user } = useAuth()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [summary, setSummary] = useState<ProgressSummary[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])

  useEffect(() => {
    getStreak().then(setStreak).catch(() => {})
    getProgressSummary().then(setSummary).catch(() => {})
    getHeatmap().then(setHeatmap).catch(() => {})
  }, [])

  if (!user) return null

  const initial = user.fullName?.trim()?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-semibold text-canvas">
          {initial}
        </div>
        <div>
          <p className="font-display text-2xl font-semibold text-ink text-balance">
            Chào, {user.fullName}
          </p>
          <p className="text-sm text-muted">Trang chủ</p>
        </div>
      </div>

      {streak && (
        <div className="mb-6 flex items-center justify-between rounded-lg bg-surface p-4 shadow-lifted">
          <div>
            <p className="text-2xl font-bold text-ink">🔥 {streak.currentStreak} ngày</p>
            <p className="text-sm text-muted">Kỷ lục: {streak.longestStreak} ngày</p>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-lg bg-surface p-5 shadow-lifted">
        <p className="mb-3 font-display text-sm font-semibold text-ink">Hoạt động học tập</p>
        <ContributionHeatmap data={heatmap} weeks={26} />
      </div>

      <div className="mb-6 rounded-lg bg-surface p-5 shadow-lifted">
        <p className="mb-3 font-display text-sm font-semibold text-ink">Tiến độ từ vựng</p>
        <ProgressBars summary={summary} />
      </div>

      <div className="flex gap-3">
        <Link
          to="/app/vocabulary"
          className="flex-1 rounded-sm bg-primary px-4 py-3 text-center font-medium text-canvas"
        >
          Học từ vựng
        </Link>
        <Link
          to="/app/decks"
          className="flex-1 rounded-sm border border-hairline px-4 py-3 text-center font-medium text-ink"
        >
          Bộ từ của tôi
        </Link>
      </div>
    </div>
  )
}
