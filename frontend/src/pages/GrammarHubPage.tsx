import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listGrammarTopics } from '../api/grammarApi'
import type { GrammarTopicSummary } from '../api/types'
import { ListCardSkeleton } from '../components/ui/Skeleton'

const LEVELS = ['A1', 'A2', 'B1']

export default function GrammarHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A1')
  const [topics, setTopics] = useState<GrammarTopicSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setSearchParams({ level }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync URL when level changes
  }, [level])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- level changed, reset loading before refetch
    setLoading(true)
    listGrammarTopics(level)
      .then(setTopics)
      .finally(() => setLoading(false))
  }, [level])

  const query = search.trim().toLowerCase()
  const visible = topics.filter(
    (t) => t.titleVi.toLowerCase().includes(query) || t.titleDe.toLowerCase().includes(query)
  )

  // Giữ đúng thứ tự chủ điểm do admin đặt; nhóm chỉ để chia tiêu đề cho dễ quét mắt.
  const groups: { label: string | null; items: GrammarTopicSummary[] }[] = []
  for (const topic of visible) {
    const last = groups[groups.length - 1]
    if (last && last.label === topic.groupLabel) last.items.push(topic)
    else groups.push({ label: topic.groupLabel, items: [topic] })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
        📐 Trung tâm ngữ pháp
      </span>

      <h2 className="font-display text-3xl font-bold text-ink">
        Ngữ <span className="text-accent-deep">pháp</span> tiếng Đức
      </h2>
      <p className="mt-2 text-sm text-muted">
        Lý thuyết ngắn gọn bằng tiếng Việt cho từng chủ điểm, kèm bài tập chấm tự động ngay. Học
        từng chủ điểm một, không cần theo thứ tự.
      </p>

      <Link
        to="/app/grammar/reference"
        className="group mt-6 flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface p-4 shadow-lifted transition-transform hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
            📋
          </span>
          <div>
            <p className="font-semibold text-ink">Bảng tra cứu nhanh</p>
            <p className="mt-0.5 text-xs text-muted">
              Chia động từ, biến cách, giới từ — mở xem giữa chừng lúc đang làm bài
            </p>
          </div>
        </div>
        <span className="text-lg text-primary transition-transform group-hover:translate-x-1">→</span>
      </Link>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm chủ điểm (vd. Perfekt, mạo từ...)"
        className="mt-6 mb-4 w-full rounded-sm border border-hairline px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              level === l
                ? 'bg-primary/12 text-primary-deep'
                : 'border border-hairline bg-surface text-ink hover:border-primary/40 hover:text-primary'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading && <ListCardSkeleton />}

      {!loading && topics.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline p-8 text-center">
          <p className="text-3xl">📐</p>
          <p className="mt-2 font-medium text-ink">Chưa có chủ điểm nào ở cấp độ này</p>
          <p className="mt-1 text-sm text-muted">Thử chọn cấp độ khác ở trên nhé.</p>
        </div>
      )}
      {!loading && topics.length > 0 && visible.length === 0 && (
        <p className="text-muted">Không tìm thấy chủ điểm nào khớp với tên bạn tìm.</p>
      )}

      {!loading &&
        groups.map((group, i) => (
          <section key={i} className="mb-6">
            {group.label && (
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
                {group.label}
              </h3>
            )}
            <ul className="space-y-2">
              {group.items.map((topic) => (
                <li key={topic.id}>
                  <Link
                    to={`/app/grammar/${topic.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface p-4 shadow-lifted transition-transform hover:-translate-y-0.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{topic.titleVi}</p>
                      <p className="truncate text-xs text-muted">{topic.titleDe}</p>
                      {topic.summaryVi && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted">{topic.summaryVi}</p>
                      )}
                    </div>
                    <span className="flex shrink-0 items-center gap-3">
                      <TopicStatusBadge topic={topic} />
                      <span className="text-lg text-primary transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}

/**
 * Huy hiệu bên phải mỗi chủ điểm. "Thành thạo" là mốc ghi nhận tiến bộ nên dùng accent — đúng
 * tinh thần "The One Warm Color Rule" trong DESIGN.md: amber dành cho những gì người học giành
 * được, không dùng làm trang trí.
 */
function TopicStatusBadge({ topic }: { topic: GrammarTopicSummary }) {
  if (topic.status === 'MASTERED') {
    return (
      <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-ink">
        ✓ Thành thạo
      </span>
    )
  }
  if (topic.status === 'LEARNING') {
    return (
      <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-medium text-primary-deep">
        {topic.correctCount}/{topic.totalCount} câu đúng
      </span>
    )
  }
  return (
    <span className="rounded-full border border-hairline px-2.5 py-0.5 text-xs font-medium text-muted">
      {topic.exerciseCount} bài tập
    </span>
  )
}
