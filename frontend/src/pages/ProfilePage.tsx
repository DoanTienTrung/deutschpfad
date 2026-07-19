import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStreak } from '../api/streakApi'
import { getProgressSummary, getHeatmap } from '../api/progressApi'
import { getVocabularyStats } from '../api/vocabularyApi'
import { listDecks } from '../api/deckApi'
import { getStudyTimeSummary, type StudyTimeSummary } from '../api/studyTimeApi'
import { formatStudyTime } from '../lib/studyTime'
import { useStudyTime } from '../context/StudyTimeContext'
import type { Streak, ProgressSummary, HeatmapDay, VocabularyStats, Deck } from '../api/types'
import ContributionHeatmap from '../components/progress/ContributionHeatmap'
import ProgressBars from '../components/progress/ProgressBars'

export default function ProfilePage() {
  const { user } = useAuth()
  const { todaySeconds } = useStudyTime()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [summary, setSummary] = useState<ProgressSummary[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])
  const [stats, setStats] = useState<VocabularyStats | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [studyTime, setStudyTime] = useState<StudyTimeSummary | null>(null)
  // Computed once in an initializer so render stays pure for the React Compiler.
  const [todayLabel] = useState(() =>
    new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
  )

  useEffect(() => {
    getStreak().then(setStreak).catch(() => {})
    getProgressSummary().then(setSummary).catch(() => {})
    getHeatmap().then(setHeatmap).catch(() => {})
    getVocabularyStats().then(setStats).catch(() => {})
    listDecks().then(setDecks).catch(() => {})
    getStudyTimeSummary().then(setStudyTime).catch(() => {})
  }, [])

  if (!user) return null

  const initial = user.fullName?.trim()?.[0]?.toUpperCase() ?? '?'

  const cardHeading = 'mb-3 text-xs font-semibold uppercase tracking-wider text-muted'

  return (
    <div className="mx-auto max-w-3xl">
      {/* Greeting + the screen's single primary action */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-semibold text-canvas">
            {initial}
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-ink text-balance sm:text-[1.75rem]">
              Chào, {user.fullName}
            </p>
            <p className="mt-0.5 text-sm capitalize text-muted">{todayLabel}</p>
          </div>
        </div>
        <Link
          to="/app/review"
          className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-display font-semibold text-canvas transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-deep hover:shadow-lifted"
        >
          Luyện tập flashcards
          {stats && stats.dueForReview > 0 && (
            <span className="rounded-full bg-canvas/20 px-2.5 py-0.5 text-xs font-medium tabular-nums">
              {stats.dueForReview} từ cần ôn
            </span>
          )}
        </Link>
      </div>

      {stats && (
        <div className="stagger-in mb-4 grid grid-cols-3 gap-3" style={{ '--stagger-index': 0 } as React.CSSProperties}>
          <div className="rounded-lg bg-surface p-5 text-center">
            <p className="font-display text-3xl font-bold tabular-nums text-ink">{stats.learned}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Đã học</p>
          </div>
          <div className="rounded-lg bg-surface p-5 text-center">
            <p className="font-display text-3xl font-bold tabular-nums text-ink">{stats.remembered}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Đã nhớ</p>
          </div>
          <div className="rounded-lg bg-surface p-5 text-center">
            <p className={`font-display text-3xl font-bold tabular-nums ${stats.dueForReview > 0 ? 'text-danger' : 'text-ink'}`}>
              {stats.dueForReview}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Cần ôn tập</p>
          </div>
        </div>
      )}

      <div className="stagger-in mb-4 grid gap-3 sm:grid-cols-2" style={{ '--stagger-index': 1 } as React.CSSProperties}>
        {streak && (
          <div className="flex items-center gap-4 rounded-lg bg-surface p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-xl">
              🔥
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-ink">
                {streak.currentStreak}{' '}
                <span className="text-base font-semibold text-muted">ngày liên tiếp</span>
              </p>
              <p className="text-sm text-muted">Kỷ lục: {streak.longestStreak} ngày</p>
            </div>
          </div>
        )}

        {studyTime && (
          <div className="rounded-lg bg-surface p-5">
            <p className={cardHeading}>Thời gian học tập</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="font-display font-bold text-ink">{formatStudyTime(todaySeconds)}</p>
                <p className="text-xs text-muted">Hôm nay</p>
              </div>
              <div>
                <p className="font-display font-bold text-ink">{formatStudyTime(studyTime.weekSeconds)}</p>
                <p className="text-xs text-muted">7 ngày qua</p>
              </div>
              <div>
                <p className="font-display font-bold text-ink">{formatStudyTime(studyTime.totalSeconds)}</p>
                <p className="text-xs text-muted">Tổng cộng</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="stagger-in mb-4 rounded-lg bg-surface p-5" style={{ '--stagger-index': 2 } as React.CSSProperties}>
        <p className={cardHeading}>Hoạt động học tập</p>
        <ContributionHeatmap data={heatmap} weeks={26} />
      </div>

      <div className="stagger-in mb-4 rounded-lg bg-surface p-5" style={{ '--stagger-index': 3 } as React.CSSProperties}>
        <p className={cardHeading}>Tiến độ từ vựng</p>
        <ProgressBars summary={summary} />
      </div>

      {decks.length > 0 && (
        <div className="stagger-in mb-6" style={{ '--stagger-index': 4 } as React.CSSProperties}>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-display text-lg font-semibold text-ink">Bộ từ bạn đang học</p>
            <Link to="/app/decks" className="text-sm font-medium text-primary hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {decks.slice(0, 4).map((deck) => (
              <Link
                key={deck.id}
                to={`/app/decks/${deck.id}`}
                className="rounded-lg border border-hairline bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
              >
                <p className="font-display font-semibold text-ink">{deck.name}</p>
                <p className="mt-1 text-sm text-muted">{deck.itemCount} từ</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to="/app/vocabulary"
          className="flex-1 rounded-md border border-hairline bg-surface px-4 py-3 text-center font-medium text-ink transition-colors hover:border-primary hover:text-primary"
        >
          Học từ vựng
        </Link>
        <Link
          to="/app/decks"
          className="flex-1 rounded-md border border-hairline bg-surface px-4 py-3 text-center font-medium text-ink transition-colors hover:border-primary hover:text-primary"
        >
          Bộ từ của tôi
        </Link>
      </div>
    </div>
  )
}
