import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Repeat2, Ruler, Table2 } from 'lucide-react'
import { Badge, Card, CardButton, Chip, EmptyState, ListCardSkeleton, PageHeader, RowButton, SearchInput } from '@kit'
import { getGrammarReview, listGrammarTopics } from '../api/grammarApi'
import type { GrammarReview, GrammarTopicSummary } from '../api/types'

const LEVELS = ['A1', 'A2', 'B1', 'B2']

export default function GrammarHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A1')
  const [topics, setTopics] = useState<GrammarTopicSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [review, setReview] = useState<GrammarReview | null>(null)

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
    // Lỗi gợi ý ôn tập không nên chặn cả danh sách chủ điểm, nên để rơi vào null im lặng.
    getGrammarReview(level)
      .then(setReview)
      .catch(() => setReview(null))
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
    <div className="mx-auto max-w-lesen">
      <PageHeader title="Ngữ pháp tiếng Đức"
        description="Lý thuyết ngắn gọn bằng tiếng Việt cho từng chủ điểm, kèm bài tập chấm tự động ngay. Học từng chủ điểm một, không cần theo thứ tự." />

      {/* Vào trang là biết ngay làm gì tiếp: chủ điểm tới hạn ôn (SM-2) đứng trước, hết hạn ôn
          thì gợi ý chủ điểm chưa học. Không có gì thì giấu hẳn thẻ, tránh chiếm chỗ vô ích. */}
      {review && (review.due.length > 0 || review.next) && (
        <Card className="mb-4 p-4">
          {review.due.length > 0 ? (
            <>
              <p className="flex items-center gap-1.5 px-3 text-xs font-bold tracking-widest text-radiert uppercase">
                <Repeat2 className="size-4" aria-hidden="true" /> Cần ôn hôm nay · {review.due.length} chủ điểm
              </p>
              <ul className="mt-2">
                {review.due.slice(0, 3).map((topic) => (
                  <li key={topic.id}>
                    <RowButton to={`/app/grammar/${topic.slug}`} title={topic.titleVi} description={topic.titleDe} />
                  </li>
                ))}
              </ul>
              {review.due.length > 3 && (
                <p className="mt-1 px-3 text-xs text-radiert">...và {review.due.length - 3} chủ điểm nữa tới hạn ôn.</p>
              )}
            </>
          ) : (
            review.next && (
              <>
                <p className="px-3 text-xs font-bold tracking-widest text-radiert uppercase">Học tiếp</p>
                <RowButton to={`/app/grammar/${review.next.slug}`} title={review.next.titleVi} description={review.next.titleDe} className="mt-1" />
              </>
            )
          )}
        </Card>
      )}

      <CardButton to="/app/grammar/reference" className="group flex items-center justify-between gap-3 p-4">
        <span className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-rund bg-karteikarte-innen text-radiert" aria-hidden="true">
            <Table2 className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-bleistift">Bảng tra cứu nhanh</span>
            <span className="mt-0.5 block text-xs text-radiert">Chia động từ, biến cách, giới từ - mở xem giữa chừng lúc đang làm bài</span>
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-radiert transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </CardButton>

      <div className="mt-6">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Tìm chủ điểm"
          placeholder="Tìm chủ điểm (vd. Perfekt, mạo từ...)" />
      </div>

      <div className="mt-4 mb-6 flex flex-wrap gap-2" role="group" aria-label="Cấp độ">
        {LEVELS.map((l) => (
          <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>{l}</Chip>
        ))}
      </div>

      {loading && <ListCardSkeleton />}

      {!loading && topics.length === 0 && (
        <EmptyState icon={<Ruler />} title="Chưa có chủ điểm nào ở cấp độ này" description="Thử chọn cấp độ khác ở trên nhé." />
      )}
      {!loading && topics.length > 0 && visible.length === 0 && (
        <p className="text-radiert">Không tìm thấy chủ điểm nào khớp với tên bạn tìm.</p>
      )}

      {!loading &&
        groups.map((group, i) => (
          <section key={i} className="mb-6">
            {group.label && (
              <h2 className="mb-2 text-xs font-bold tracking-widest text-radiert uppercase">{group.label}</h2>
            )}
            <ul className="space-y-2">
              {group.items.map((topic) => (
                <li key={topic.id}>
                  <CardButton to={`/app/grammar/${topic.slug}`} className="group flex items-center justify-between gap-3 p-4">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-bleistift">{topic.titleVi}</span>
                      <span className="block truncate text-xs text-radiert">{topic.titleDe}</span>
                      {topic.summaryVi && <span className="mt-1 line-clamp-2 block text-sm text-radiert">{topic.summaryVi}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <TopicStatusBadge topic={topic} />
                      <ArrowRight className="size-4 text-radiert transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </CardButton>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}

/**
 * Huy hiệu bên phải mỗi chủ điểm. "Thành thạo" là mốc ghi nhận tiến bộ nên dùng hổ phách — đúng
 * tinh thần "The One Warm Color Rule" trong DESIGN.md: hổ phách dành cho những gì người học giành
 * được, không dùng làm trang trí.
 */
function TopicStatusBadge({ topic }: { topic: GrammarTopicSummary }) {
  if (topic.status === 'MASTERED') {
    return <Badge tone="emph"><Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> Thành thạo</Badge>
  }
  if (topic.status === 'LEARNING') {
    return <Badge tone="info">{topic.correctCount}/{topic.totalCount} câu đúng</Badge>
  }
  return <Badge>{topic.exerciseCount} bài tập</Badge>
}
