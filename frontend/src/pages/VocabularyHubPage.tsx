import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, BookOpen, CaseSensitive, GraduationCap, House, Library, TrendingUp } from 'lucide-react'
import { Badge, ButtonLink, Card, CardButton, Chip, EmptyState, ListCardSkeleton, PageHeader, cn } from '@kit'
import { listLessonsByLevel, listLessonsBySource } from '../api/lessonApi'
import type { LessonSummary } from '../api/types'
import PronunciationSection from '../components/pronunciation/PronunciationSection'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const GOETHE_LEVELS = ['A1', 'A2', 'B1']

// 'alphabet' thay cho 'topic' (học theo chủ đề — chưa từng có chủ đề nào; nội dung theo tình huống nay ở
// 'life'). Link cũ ?mode=topic được chuyển sang 'alphabet'.
type Mode = 'level' | 'alphabet' | 'goethe' | 'textbook' | 'life'

const MODE_CARDS: { mode: Mode; icon: ReactNode; title: string; desc: string }[] = [
  { mode: 'alphabet', icon: <CaseSensitive />, title: 'Bảng chữ cái & phát âm', desc: 'Chữ cái, âm ghép, đánh vần' },
  { mode: 'level', icon: <TrendingUp />, title: 'Theo cấp độ', desc: 'Từ thông dụng A1-C1' },
  { mode: 'goethe', icon: <GraduationCap />, title: 'Ôn thi Goethe', desc: 'Wortliste A1-B1' },
  { mode: 'life', icon: <House />, title: 'Sống ở Đức', desc: 'Cư trú, thuê nhà, đi khám...' },
  { mode: 'textbook', icon: <BookOpen />, title: 'Bộ từ của Giang', desc: 'Giáo trình Menschen A1 (chỉ admin)' },
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


  return (
    <div className="mx-auto max-w-seite">
      <PageHeader title="Từ vựng"
        description="Mới bắt đầu? Làm quen bảng chữ cái và cách phát âm trước, rồi học từ theo cấp độ, theo kỳ thi Goethe hoặc theo tình huống sống ở Đức." />

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MODE_CARDS.filter((c) => c.mode !== 'textbook' || textbookAvailable).map((c) => {
          const active = mode === c.mode
          return (
            <CardButton key={c.mode} onClick={() => setMode(c.mode)} aria-pressed={active}
              className={cn('group flex items-center justify-between gap-3 p-4', active && 'border-bleistift')}>
              <span className="flex min-w-0 items-center gap-3">
                <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-rund [&_svg]:size-5',
                  active ? 'bg-bleistift text-bleistift-invers' : 'bg-karteikarte-innen text-radiert')} aria-hidden="true">
                  {c.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-bleistift">{c.title}</span>
                  <span className="mt-0.5 block text-xs text-radiert">{c.desc}</span>
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-radiert transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </CardButton>
          )
        })}
      </div>

      {mode === 'life' && (
        <p className="mb-6 text-sm text-radiert">
          Từ vựng cho những việc phải làm ngay khi sang Đức - đăng ký cư trú, thuê nhà, đi khám, mở tài
          khoản, đi tàu, đổ rác, xin việc, gọi cấp cứu. Mỗi bài 25 từ, có câu ví dụ và bản dịch.
        </p>
      )}

      {mode === 'level' && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Cấp độ">
          {LEVELS.map((l) => (
            <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>{l}</Chip>
          ))}
        </div>
      )}

      {mode === 'goethe' && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Kỳ thi">
          {GOETHE_LEVELS.map((l) => (
            <Chip key={l} selected={goetheLevel === l} onClick={() => setGoetheLevel(l)}>Goethe-Zertifikat {l}</Chip>
          ))}
        </div>
      )}

      {mode === 'alphabet' && <PronunciationSection />}

      {mode !== 'alphabet' && loading && <ListCardSkeleton />}

      {mode !== 'alphabet' && !loading && lessons.length === 0 && (
        <EmptyState icon={<Library />} title="Chưa có bộ từ nào ở đây" description="Thử chọn cấp độ khác ở trên nhé." />
      )}

      {mode !== 'alphabet' && !loading && lessons.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson, i) => (
            <Card key={lesson.id} style={{ '--stagger-index': i % 12 } as CSSProperties} className="stagger-in flex flex-col justify-between p-4">
              <div>
                <p className="font-display font-semibold text-bleistift">
                  {mode === 'level' || mode === 'goethe' ? `Bài ${lesson.orderIndex}: ` : ''}
                  {lesson.title}
                </p>
                {lesson.description && <p className="mt-1 line-clamp-2 text-sm text-radiert">{lesson.description}</p>}
                <p className="mt-2 flex items-center gap-2 text-xs text-radiert">
                  <Badge>{lesson.level}</Badge>
                  {lesson.wordCount} từ
                </p>
              </div>
              <ButtonLink to={`/app/practice/${lesson.id}`} size="sm" className="mt-4 w-full">Học ngay</ButtonLink>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
