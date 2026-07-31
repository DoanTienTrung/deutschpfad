import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listLessonsByLevel, listLessonsByTopic } from '../api/lessonApi'
import { listTopics } from '../api/topicApi'
import type { LessonSummary, Topic } from '../api/types'
import { ListCardSkeleton } from '../components/ui/Skeleton'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const GOETHE_LEVELS = ['A1', 'A2', 'B1']

type Mode = 'level' | 'topic' | 'goethe' | 'textbook'

function isMode(value: string | null): value is Mode {
  return value === 'level' || value === 'topic' || value === 'goethe' || value === 'textbook'
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
    // 'textbook' has no extra selector (only one level exists so far) -- nothing to sync
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
    } else if (mode === 'textbook') {
      listLessonsByLevel('A1', 'TEXTBOOK')
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

  // Chips per DESIGN.md: pill-shaped, surface + hairline at rest, primary/12 fill when selected.
  const chipClass = (selected: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      selected
        ? 'bg-primary/12 text-primary-deep'
        : 'border border-hairline bg-surface text-ink hover:border-primary/40 hover:text-primary'
    }`

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="font-display text-2xl font-bold text-ink">Từ vựng</h2>
      <p className="mt-1 mb-6 text-sm text-muted">
        Học theo lộ trình cấp độ, theo chủ đề thực tế, hoặc bám sát Wortliste của kỳ thi Goethe.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setMode('level')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === 'level' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
          }`}
        >
          Theo cấp độ
        </button>
        <button
          onClick={() => setMode('topic')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === 'topic' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
          }`}
        >
          Theo chủ đề
        </button>
        <button
          onClick={() => setMode('goethe')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === 'goethe' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
          }`}
        >
          Ôn thi Goethe
        </button>
        <button
          onClick={() => setMode('textbook')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === 'textbook' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
          }`}
        >
          Bộ từ của Giang
        </button>
      </div>

      {mode === 'level' && (
        <div className="mb-6 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={chipClass(level === l)}>
              {l}
            </button>
          ))}
        </div>
      )}

      {mode === 'goethe' && (
        <div className="mb-6 flex flex-wrap gap-2">
          {GOETHE_LEVELS.map((l) => (
            <button key={l} onClick={() => setGoetheLevel(l)} className={chipClass(goetheLevel === l)}>
              Goethe-Zertifikat {l}
            </button>
          ))}
        </div>
      )}

      {mode === 'topic' && (
        <div className="mb-6 flex flex-wrap gap-2">
          {topics.length === 0 && <p className="text-sm text-muted">Chưa có chủ đề nào.</p>}
          {topics.map((t) => (
            <button key={t.id} onClick={() => setTopicId(t.id)} className={chipClass(topicId === t.id)}>
              {t.name}
            </button>
          ))}
        </div>
      )}

      {loading && <ListCardSkeleton />}

      {!loading && lessons.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline p-8 text-center">
          <p className="text-3xl">📚</p>
          <p className="mt-2 font-medium text-ink">Chưa có bộ từ nào ở đây</p>
          <p className="mt-1 text-sm text-muted">Thử chọn cấp độ hoặc chủ đề khác ở trên nhé.</p>
        </div>
      )}

      {!loading && lessons.length > 0 && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, i) => (
          <div
            key={lesson.id}
            style={{ '--stagger-index': i % 12 } as React.CSSProperties}
            className="stagger-in flex flex-col justify-between rounded-lg border border-hairline bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <div>
              <p className="font-display font-semibold text-ink">
                {mode === 'level' || mode === 'goethe' ? `Bài ${lesson.orderIndex}: ` : ''}
                {lesson.title}
              </p>
              {lesson.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{lesson.description}</p>
              )}
              <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                <span className="rounded-full bg-surface px-2 py-0.5 font-medium text-ink">{lesson.level}</span>
                {lesson.wordCount} từ
              </p>
            </div>
            <Link
              to={`/app/practice/${lesson.id}`}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-canvas transition-colors hover:bg-primary-deep"
            >
              Học ngay
            </Link>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
