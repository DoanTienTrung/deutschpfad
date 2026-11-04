import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Breadcrumb, CardGridSkeleton, Chip, EmptyState, NativeSelect, SearchInput } from '@kit'
import { listListeningByLevel } from '../api/listeningApi'
import type { ListeningExerciseSummary } from '../api/types'
import ExerciseGrid from '../components/listening/ExerciseGrid'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function ListeningExamPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A2')
  const [topic, setTopic] = useState(() => searchParams.get('topic') ?? '')
  const [exercises, setExercises] = useState<ListeningExerciseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const examOnly = exercises.filter((e) => e.kind === 'EXAM')
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
    <div className="mx-auto max-w-seite">
      <Breadcrumb items={[{ label: 'Nghe', to: '/app/listening' }, { label: 'Luyện qua Đề thi' }]} />

      <div className="mb-4">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên bài..." aria-label="Tìm theo tên bài..." />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>{l}</Chip>
          ))}
        </div>
        {topics.length > 0 && (
          <NativeSelect value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Chủ đề" className="min-h-10">
            <option value="">Tất cả chủ đề</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </NativeSelect>
        )}
      </div>

      {loading && <CardGridSkeleton />}

      {!loading && examOnly.length === 0 && (
        <EmptyState title="Chưa có bài thi mẫu nào ở cấp độ này" description="Thử chọn cấp độ khác ở trên nhé." />
      )}
      {!loading && examOnly.length > 0 && visibleExercises.length === 0 && (
        <p className="text-radiert">Không tìm thấy bài nào khớp với tên bạn tìm.</p>
      )}

      {!loading && visibleExercises.length > 0 && <ExerciseGrid exercises={visibleExercises} />}
    </div>
  )
}
