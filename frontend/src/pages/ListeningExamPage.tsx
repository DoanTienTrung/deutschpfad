import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listListeningByLevel } from '../api/listeningApi'
import type { ListeningExerciseSummary } from '../api/types'
import ExerciseGrid from '../components/listening/ExerciseGrid'
import ListeningBreadcrumb from '../components/listening/ListeningBreadcrumb'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function ListeningExamPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A2')
  const [topic, setTopic] = useState(() => searchParams.get('topic') ?? '')
  const [exercises, setExercises] = useState<ListeningExerciseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const examOnly = exercises.filter((e) => !e.youtubeVideoId)
  const topics = [...new Set(examOnly.map((e) => e.topic).filter((t): t is string => !!t))]
  const visibleExercises = examOnly
    .filter((e) => e.title.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((e) => !topic || e.topic === topic)

  useEffect(() => {
    setSearchParams(topic ? { level, topic } : { level }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync URL when level/topic changes
  }, [level, topic])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- level changed, reset loading before refetch
    setLoading(true)
    listListeningByLevel(level)
      .then(setExercises)
      .finally(() => setLoading(false))
  }, [level])

  return (
    <div className="mx-auto max-w-5xl">
      <ListeningBreadcrumb items={[{ label: '🎧 Nghe', to: '/app/listening' }, { label: '📝 Luyện qua Đề thi' }]} />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên bài..."
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

      {!loading && examOnly.length === 0 && (
        <p className="text-muted">Chưa có bài thi mẫu nào ở cấp độ này.</p>
      )}
      {!loading && examOnly.length > 0 && visibleExercises.length === 0 && (
        <p className="text-muted">Không tìm thấy bài nào khớp với tên bạn tìm.</p>
      )}

      <ExerciseGrid exercises={visibleExercises} />
    </div>
  )
}
