import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listLessonsByLevel, listLessonsBySource } from '../api/lessonApi'
import type { LessonSummary } from '../api/types'
import PronunciationSection from '../components/pronunciation/PronunciationSection'
import { ListCardSkeleton } from '../components/ui/Skeleton'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const GOETHE_LEVELS = ['A1', 'A2', 'B1']

// 'alphabet' thay cho 'topic' (học theo chủ đề — chưa từng có chủ đề nào; nội dung theo tình huống nay ở
// 'life'). Link cũ ?mode=topic được chuyển sang 'alphabet'.
type Mode = 'level' | 'alphabet' | 'goethe' | 'textbook' | 'life'

const MODE_CARDS: { mode: Mode; icon: string; title: string; desc: string }[] = [
  { mode: 'alphabet', icon: '🔤', title: 'Bảng chữ cái & phát âm', desc: 'Chữ cái, âm ghép, đánh vần' },
  { mode: 'level', icon: '📈', title: 'Theo cấp độ', desc: 'Từ thông dụng A1–C1' },
  { mode: 'goethe', icon: '🎓', title: 'Ôn thi Goethe', desc: 'Wortliste A1–B1' },
  { mode: 'life', icon: '🏠', title: 'Sống ở Đức', desc: 'Cư trú, thuê nhà, đi khám…' },
  { mode: 'textbook', icon: '📗', title: 'Bộ từ của Giang', desc: 'Giáo trình Menschen A1 (chỉ admin)' },
]

function isMode(value: string | null): value is Mode {
  return value === 'level' || value === 'alphabet' || value === 'goethe' || value === 'textbook' || value === 'life'
}

export default function VocabularyHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  // "Bộ từ của Giang" lấy từ trang Lernwortschatz của Menschen A1 (Hueber) — đang ẩn với người học
  // (backend quyết định, xem VocabularyVisibility / app.vocabulary.hidden-sources). Chỉ hiện nút khi
  // backend còn trả bài, nên mở lại bằng cấu hình là đủ, không phải sửa frontend.
  const [textbookAvailable, setTextbookAvailable] = useState(false)

  const [mode, setMode] = useState<Mode>(() => {
    const m = searchParams.get('mode')
    if (m === 'topic') return 'alphabet'
    // Mở trang lần đầu: bảng chữ cái & phát âm — điểm bắt đầu tự nhiên của người mới học.
    return isMode(m) ? m : 'alphabet'
  })

  useEffect(() => {
    listLessonsByLevel('A1', 'TEXTBOOK')
      .then((l) => {
        setTextbookAvailable(l.length > 0)
        if (l.length === 0) setMode((current) => (current === 'textbook' ? 'alphabet' : current))
      })
      .catch(() => {})
  }, [])
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A1')
  const [goetheLevel, setGoetheLevel] = useState(() => searchParams.get('goetheLevel') ?? 'A1')
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const next: Record<string, string> = { mode }
    if (mode === 'level') next.level = level
    if (mode === 'goethe') next.goetheLevel = goetheLevel
    // 'textbook' has no extra selector (only one level exists so far) -- nothing to sync
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync URL when selection actually changes
  }, [mode, level, goetheLevel])

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
    } else if (mode === 'life') {
      listLessonsBySource('LIFE')
        .then(setLessons)
        .finally(() => setLoading(false))
    } else {
      setLessons([])
      setLoading(false)
    }
  }, [mode, level, goetheLevel])

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
        Mới bắt đầu? Làm quen bảng chữ cái và cách phát âm trước, rồi học từ theo cấp độ, theo kỳ thi Goethe
        hoặc theo tình huống sống ở Đức.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MODE_CARDS.filter((c) => c.mode !== 'textbook' || textbookAvailable).map((c) => {
          const active = mode === c.mode
          return (
            <button
              key={c.mode}
              onClick={() => setMode(c.mode)}
              aria-pressed={active}
              className={`group flex items-center justify-between gap-3 rounded-lg p-4 text-left transition-all duration-150 hover:-translate-y-0.5 ${
                active ? 'bg-primary text-canvas shadow-lifted' : 'border border-hairline bg-card text-ink hover:shadow-lifted'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                    active ? 'bg-canvas/15' : 'bg-surface'
                  }`}
                >
                  {c.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold uppercase tracking-wide">{c.title}</span>
                  <span className={`mt-0.5 block text-xs ${active ? 'text-canvas/70' : 'text-muted'}`}>{c.desc}</span>
                </span>
              </span>
              <span className="shrink-0 text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </button>
          )
        })}
      </div>

      {mode === 'life' && (
        <p className="mb-6 text-sm text-muted">
          Từ vựng cho những việc phải làm ngay khi sang Đức - đăng ký cư trú, thuê nhà, đi khám, mở tài
          khoản, đi tàu, đổ rác, xin việc, gọi cấp cứu. Mỗi bài 25 từ, có câu ví dụ và bản dịch.
        </p>
      )}

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

      {mode === 'alphabet' && <PronunciationSection />}

      {mode !== 'alphabet' && loading && <ListCardSkeleton />}

      {mode !== 'alphabet' && !loading && lessons.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline p-8 text-center">
          <p className="text-3xl">📚</p>
          <p className="mt-2 font-medium text-ink">Chưa có bộ từ nào ở đây</p>
          <p className="mt-1 text-sm text-muted">Thử chọn cấp độ khác ở trên nhé.</p>
        </div>
      )}

      {mode !== 'alphabet' && !loading && lessons.length > 0 && (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, i) => (
          <div
            key={lesson.id}
            style={{ '--stagger-index': i % 12 } as React.CSSProperties}
            className="stagger-in flex flex-col justify-between rounded-lg border border-hairline bg-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
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
