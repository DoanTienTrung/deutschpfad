import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listListeningByLevel, listListeningTopics } from '../api/listeningApi'
import type { ListeningExerciseSummary } from '../api/types'
import { getYoutubeThumbnailUrl, formatDuration } from '../lib/youtubeThumbnail'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function ListeningHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A1')
  const [topic, setTopic] = useState(() => searchParams.get('topic') ?? '')
  const [topics, setTopics] = useState<string[]>([])
  const [exercises, setExercises] = useState<ListeningExerciseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const visibleExercises = exercises.filter((e) => e.title.toLowerCase().includes(search.trim().toLowerCase()))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, topic list is global
    listListeningTopics().then(setTopics)
  }, [])

  useEffect(() => {
    setSearchParams(topic ? { level, topic } : { level }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync URL when level/topic changes
  }, [level, topic])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- level/topic changed, reset loading before refetch
    setLoading(true)
    listListeningByLevel(level, topic || undefined)
      .then(setExercises)
      .finally(() => setLoading(false))
  }, [level, topic])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">Nghe</h2>
        <Link to="/app/listening/mine" className="text-sm font-medium text-primary hover:underline">
          🎬 Video của tôi
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên video..."
        className="mb-4 w-full rounded-sm border border-hairline px-3 py-2 text-sm"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                level === l ? 'bg-accent/30 text-ink' : 'border border-hairline text-ink hover:bg-surface'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        {topics.length > 0 && (
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-sm border border-hairline px-3 py-1.5 text-sm text-ink"
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
      </div>

      {loading && <p className="text-muted">Đang tải...</p>}

      {!loading && exercises.length === 0 && <p className="text-muted">Chưa có bài nghe nào ở cấp độ này.</p>}
      {!loading && exercises.length > 0 && visibleExercises.length === 0 && (
        <p className="text-muted">Không tìm thấy video nào khớp với tên bạn tìm.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {visibleExercises.map((exercise) => (
          <Link key={exercise.id} to={`/app/listening/${exercise.id}`} className="group">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-surface">
              <img
                src={getYoutubeThumbnailUrl(exercise.youtubeVideoId)}
                alt={exercise.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-canvas">
                {exercise.levelMin === exercise.levelMax
                  ? exercise.levelMin
                  : `${exercise.levelMin}-${exercise.levelMax}`}
              </span>
              {exercise.durationSeconds != null && (
                <span className="absolute bottom-2 right-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                  {formatDuration(exercise.durationSeconds)}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-semibold text-ink group-hover:text-primary">{exercise.title}</p>
            <p className="mt-0.5 text-xs text-muted">{exercise.sentenceCount} câu</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
