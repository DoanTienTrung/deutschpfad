import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listTranslationSets, type TranslationSetSummary, type TranslationType } from '../api/translationApi'
import ListeningBreadcrumb from '../components/listening/ListeningBreadcrumb'
import { ListCardSkeleton } from '../components/ui/Skeleton'

const LEVELS = ['A1', 'A2', 'B1', 'B2']

const TYPE_CARDS: { type: TranslationType; icon: string; title: string; desc: string; ready: boolean }[] = [
  { type: 'GRAMMAR', icon: '🧩', title: 'Câu theo ngữ pháp', desc: 'Mỗi bài một chủ điểm, A1-B2', ready: true },
  { type: 'COLLOCATION', icon: '🔗', title: 'Collocation', desc: 'Cụm từ cố định: eine Entscheidung treffen', ready: false },
  { type: 'PARAGRAPH', icon: '📄', title: 'Đoạn văn', desc: 'Dịch đoạn 4-8 câu, từ nối và trật tự từ', ready: false },
  { type: 'ESSAY', icon: '📝', title: 'Essay', desc: 'Bài hoàn chỉnh theo dạng đề thi, B2-C1', ready: false },
]

const chipClass = (selected: boolean) =>
  `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
    selected
      ? 'bg-primary/12 text-primary-deep'
      : 'border border-hairline bg-surface text-ink hover:border-primary/40 hover:text-primary'
  }`

export default function TranslationHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const level = LEVELS.includes(searchParams.get('level') ?? '') ? searchParams.get('level')! : 'A1'
  const type: TranslationType = 'GRAMMAR'
  const [sets, setSets] = useState<TranslationSetSummary[] | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- level changed, show skeleton before refetch
    setSets(null)
    listTranslationSets(type, level)
      .then(setSets)
      .catch(() => setSets([]))
  }, [level])

  const done = sets?.filter((s) => s.itemCount > 0 && s.passedCount >= s.itemCount).length ?? 0

  return (
    <div className="mx-auto max-w-5xl">
      <ListeningBreadcrumb items={[{ label: 'Viết', to: '/app/writing' }, { label: 'Luyện dịch' }]} />
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">Luyện dịch Việt → Đức</h2>
      <p className="mt-1 mb-6 text-sm text-muted">
        Đi từ câu ngắn theo từng chủ điểm ngữ pháp, tới cụm từ cố định, đoạn văn và cả bài. Mỗi câu được chấm
        ngay, câu diễn đạt khác câu mẫu mà vẫn đúng thì vẫn được tính đúng.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TYPE_CARDS.map((c) => {
          const active = c.type === type
          return (
            <div
              key={c.type}
              aria-current={active ? 'true' : undefined}
              className={`flex items-center gap-3 rounded-lg p-4 ${
                active ? 'bg-primary text-canvas shadow-lifted' : 'border border-dashed border-hairline bg-card text-ink'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${active ? 'bg-canvas/15' : 'bg-surface'}`}
                aria-hidden="true"
              >
                {c.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{c.title}</span>
                <span className={`block text-xs ${active ? 'text-canvas/75' : 'text-muted'}`}>
                  {c.ready ? c.desc : 'Sắp ra mắt'}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Cấp độ">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setSearchParams({ level: l }, { replace: true })} aria-pressed={l === level} className={chipClass(l === level)}>
              {l}
            </button>
          ))}
        </div>
        {sets && sets.length > 0 && (
          <p className="text-sm text-muted">
            Đã xong <span className="font-semibold text-ink">{done}</span> / {sets.length} chủ điểm
          </p>
        )}
      </div>

      {!sets && <ListCardSkeleton />}

      {sets && sets.length === 0 && (
        <div className="rounded-xl border border-dashed border-hairline p-8 text-center">
          <p className="font-medium text-ink">Chủ điểm {level} đang được soạn</p>
          <p className="mt-1 text-sm text-muted">Hiện đã có đủ chủ điểm A1 và A2, bạn luyện các cấp đó trước nhé.</p>
        </div>
      )}

      {sets && sets.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {sets.map((s, i) => {
            const complete = s.itemCount > 0 && s.passedCount >= s.itemCount
            const pct = s.itemCount ? Math.round((Math.min(s.passedCount, s.itemCount) / s.itemCount) * 100) : 0
            return (
              <li key={s.id} style={{ '--stagger-index': i % 12 } as React.CSSProperties} className="stagger-in">
                <Link
                  to={`/app/writing/translate/${s.id}`}
                  className="group flex h-full flex-col rounded-lg border border-hairline bg-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink group-hover:text-primary">{s.title}</p>
                      {s.subtitle && <p className="mt-0.5 text-sm text-muted">{s.subtitle}</p>}
                    </div>
                    {complete && (
                      <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-ink">Xong</span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center gap-3 pt-4">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {Math.min(s.passedCount, s.itemCount)}/{s.itemCount} câu
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
