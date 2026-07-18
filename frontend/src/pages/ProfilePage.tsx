import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStreak } from '../api/streakApi'
import { getProgressSummary, getHeatmap } from '../api/progressApi'
import { getVocabularyStats } from '../api/vocabularyApi'
import { listDecks } from '../api/deckApi'
import type { Streak, ProgressSummary, HeatmapDay, VocabularyStats, Deck } from '../api/types'
import ContributionHeatmap from '../components/progress/ContributionHeatmap'
import ProgressBars from '../components/progress/ProgressBars'

export default function ProfilePage() {
  const { user } = useAuth()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [summary, setSummary] = useState<ProgressSummary[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])
  const [stats, setStats] = useState<VocabularyStats | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])

  useEffect(() => {
    getStreak().then(setStreak).catch(() => {})
    getProgressSummary().then(setSummary).catch(() => {})
    getHeatmap().then(setHeatmap).catch(() => {})
    getVocabularyStats().then(setStats).catch(() => {})
    listDecks().then(setDecks).catch(() => {})
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

      <Link
        to="/app/review"
        className="mb-6 block rounded-lg border border-primary bg-primary/5 px-6 py-4 text-center font-display font-semibold text-primary hover:bg-primary/10"
      >
        Luyện tập flashcards
        {stats && stats.dueForReview > 0 && (
          <span className="ml-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-canvas">
            {stats.dueForReview} từ cần ôn
          </span>
        )}
      </Link>

      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg bg-surface p-4 text-center shadow-lifted">
            <p className="font-display text-2xl font-bold text-ink">{stats.learned}</p>
            <p className="text-sm text-muted">Đã học</p>
          </div>
          <div className="rounded-lg bg-surface p-4 text-center shadow-lifted">
            <p className="font-display text-2xl font-bold text-ink">{stats.remembered}</p>
            <p className="text-sm text-muted">Đã nhớ</p>
          </div>
          <div className="rounded-lg bg-surface p-4 text-center shadow-lifted">
            <p className="font-display text-2xl font-bold text-danger">{stats.dueForReview}</p>
            <p className="text-sm text-muted">Cần ôn tập</p>
          </div>
        </div>
      )}

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

      {decks.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-lg font-bold text-ink">Danh sách các bộ từ bạn đang học</p>
            <Link to="/app/decks" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {decks.slice(0, 4).map((deck) => (
              <Link
                key={deck.id}
                to={`/app/decks/${deck.id}`}
                className="rounded-lg border border-hairline bg-white p-4 hover:bg-surface"
              >
                <p className="font-medium text-ink">{deck.name}</p>
                <p className="mt-1 text-sm text-muted">📋 {deck.itemCount} từ</p>
              </Link>
            ))}
          </div>
        </div>
      )}

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
