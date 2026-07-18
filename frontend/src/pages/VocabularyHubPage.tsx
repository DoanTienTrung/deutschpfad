import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listLessonsByLevel, listLessonsByTopic } from '../api/lessonApi'
import { listTopics } from '../api/topicApi'
import type { LessonSummary, Topic } from '../api/types'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const GOETHE_LEVELS = ['A1', 'A2', 'B1']

type Mode = 'level' | 'topic' | 'goethe'

function isMode(value: string | null): value is Mode {
  return value === 'level' || value === 'topic' || value === 'goethe'
}

export default function VocabularyHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [mode, setMode] = useState<Mode>(() => {
    const m = searchParams.get('mode')
    return isMode(m) ? m : 'level'
  })
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A1')
  const [goetheLevel, setGoetheLevel] = useState(() => searchParams.get('goetheLevel') ?? 'A1')
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicId, setTopicId] = useState<number | null>(() => {
    const t = searchParams.get('topicId')
    return t ? Number(t) : null
  })
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listTopics().then((t) => {
      setTopics(t)
      if (t.length > 0) setTopicId((current) => current ?? t[0].id)
    })
  }, [])

  useEffect(() => {
    const next: Record<string, string> = { mode }
    if (mode === 'level') next.level = level
    if (mode === 'goethe') next.goetheLevel = goetheLevel
    if (mode === 'topic' && topicId !== null) next.topicId = String(topicId)
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync URL when selection actually changes
  }, [mode, level, goetheLevel, topicId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mode/level/topic changed, reset loading before refetch
    setLoading(true)
    if (mode === 'level') {
      listLessonsByLevel(level, 'FREQUENCY')
        .then(setLessons)
        .finally(() => setLoading(false))
    } else if (mode === 'goethe') {
      listLessonsByLevel(goetheLevel, 'GOETHE')
        .then(setLessons)
        .finally(() => setLoading(false))
    } else if (topicId !== null) {
      listLessonsByTopic(topicId)
        .then(setLessons)
        .finally(() => setLoading(false))
    } else {
      setLessons([])
      setLoading(false)
    }
  }, [mode, level, goetheLevel, topicId])

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Từ vựng</h2>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setMode('level')}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
            mode === 'level' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
          }`}
        >
          Theo cấp độ
        </button>
        <button
          onClick={() => setMode('topic')}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
            mode === 'topic' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
          }`}
        >
          Theo chủ đề
        </button>
        <button
          onClick={() => setMode('goethe')}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
            mode === 'goethe' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
          }`}
        >
          Ôn thi Goethe
        </button>
      </div>

      {mode === 'level' && (
        <div className="mb-6 flex gap-2">
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
      )}

      {mode === 'goethe' && (
        <div className="mb-6 flex gap-2">
          {GOETHE_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setGoetheLevel(l)}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                goetheLevel === l ? 'bg-accent/30 text-ink' : 'border border-hairline text-ink hover:bg-surface'
              }`}
            >
              Goethe-Zertifikat {l}
            </button>
          ))}
        </div>
      )}

      {mode === 'topic' && (
        <div className="mb-6 flex flex-wrap gap-2">
          {topics.length === 0 && <p className="text-sm text-muted">Chưa có chủ đề nào.</p>}
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setTopicId(t.id)}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                topicId === t.id ? 'bg-accent/30 text-ink' : 'border border-hairline text-ink hover:bg-surface'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-muted">Đang tải...</p>}

      {!loading && lessons.length === 0 && <p className="text-muted">Chưa có bộ từ nào ở đây.</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col justify-between rounded-md border border-hairline bg-white p-4 shadow-lifted"
          >
            <div>
              <p className="font-display font-semibold text-ink">
                {mode === 'level' || mode === 'goethe' ? `Bài ${lesson.orderIndex}: ` : ''}
                {lesson.title}
              </p>
              {lesson.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{lesson.description}</p>
              )}
              <p className="mt-2 text-xs text-muted">
                [{lesson.level}] {lesson.wordCount} từ
              </p>
            </div>
            <Link
              to={`/app/practice/${lesson.id}`}
              className="mt-4 rounded-sm bg-primary px-4 py-2 text-center text-sm font-medium text-canvas hover:bg-primary-deep"
            >
              Học ngay
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
