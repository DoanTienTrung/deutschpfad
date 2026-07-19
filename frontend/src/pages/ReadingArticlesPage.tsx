import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listReadingByLevel } from '../api/readingApi'
import type { ReadingPassageSummary } from '../api/types'
import ReadingPassageGrid from '../components/reading/ReadingPassageGrid'
import ListeningBreadcrumb from '../components/listening/ListeningBreadcrumb'
import { CardGridSkeleton } from '../components/ui/Skeleton'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function ReadingArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A2')
  const [topic, setTopic] = useState(() => searchParams.get('topic') ?? '')
  const [passages, setPassages] = useState<ReadingPassageSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const articlesOnly = passages.filter((p) => p.category === 'ARTICLE')
  const topics = [...new Set(articlesOnly.map((p) => p.topic).filter((t): t is string => !!t))]
  const visiblePassages = articlesOnly
    .filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((p) => !topic || p.topic === topic)

  useEffect(() => {
    setSearchParams(topic ? { level, topic } : { level }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync URL when level/topic changes
  }, [level, topic])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- level changed, reset loading before refetch
    setLoading(true)
    listReadingByLevel(level)
      .then(setPassages)
      .finally(() => setLoading(false))
  }, [level])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <ListeningBreadcrumb
          items={[{ label: '📖 Đọc', to: '/app/reading' }, { label: '📰 Đọc qua Sách, Báo' }]}
        />
        <Link
          to="/app/reading/mine"
          className="shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold text-primary transition-colors hover:bg-accent/20"
        >
          📚 Bài đọc của tôi
        </Link>
      </div>

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
                level === l ? 'bg-primary/12 text-primary-deep' : 'border border-hairline text-ink hover:bg-surface'
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

      {loading && <CardGridSkeleton />}

      {!loading && articlesOnly.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline p-8 text-center">
          <p className="text-3xl">📰</p>
          <p className="mt-2 font-medium text-ink">Chưa có bài báo/sách nào ở cấp độ này</p>
          <p className="mt-1 text-sm text-muted">Thử chọn cấp độ khác ở trên nhé.</p>
        </div>
      )}
      {!loading && articlesOnly.length > 0 && visiblePassages.length === 0 && (
        <p className="text-muted">Không tìm thấy bài nào khớp với tên bạn tìm.</p>
      )}

      {!loading && visiblePassages.length > 0 && <ReadingPassageGrid passages={visiblePassages} />}
    </div>
  )
}
