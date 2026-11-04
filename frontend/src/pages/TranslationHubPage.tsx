import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Link2, NotebookPen, Puzzle } from 'lucide-react'
import { Badge, CardButton, Chip, EmptyState, ListCardSkeleton, PageHeader, cn } from '@kit'
import { listTranslationSets, type TranslationSetSummary, type TranslationType } from '../api/translationApi'

const LEVELS = ['A1', 'A2', 'B1', 'B2']

const TYPE_CARDS: { type: TranslationType; icon: ReactNode; title: string; desc: string; ready: boolean }[] = [
  { type: 'GRAMMAR', icon: <Puzzle />, title: 'Câu theo ngữ pháp', desc: 'Mỗi bài một chủ điểm, A1-B2', ready: true },
  { type: 'COLLOCATION', icon: <Link2 />, title: 'Collocation', desc: 'Cụm từ cố định: eine Entscheidung treffen', ready: false },
  { type: 'PARAGRAPH', icon: <FileText />, title: 'Đoạn văn', desc: 'Dịch đoạn 4-8 câu, từ nối và trật tự từ', ready: false },
  { type: 'ESSAY', icon: <NotebookPen />, title: 'Essay', desc: 'Bài hoàn chỉnh theo dạng đề thi, B2-C1', ready: false },
]

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
    <div className="mx-auto max-w-seite">
      <PageHeader title="Luyện dịch Việt - Đức" back={{ to: '/app/writing', label: 'Viết' }}
        description="Đi từ câu ngắn theo từng chủ điểm ngữ pháp, tới cụm từ cố định, đoạn văn và cả bài. Mỗi câu được chấm ngay, câu diễn đạt khác câu mẫu mà vẫn đúng thì vẫn được tính đúng." />

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TYPE_CARDS.map((c) => {
          const active = c.type === type
          return (
            <div key={c.type} aria-current={active ? 'true' : undefined}
              className={cn('flex items-center gap-3 rounded-karte p-4',
                active ? 'border border-bleistift bg-karteikarte shadow-lift' : 'border border-dashed border-kante')}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-rund bg-karteikarte-innen text-radiert [&_svg]:size-5" aria-hidden="true">
                {c.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-bleistift">{c.title}</span>
                <span className="block text-xs text-radiert">{c.ready ? c.desc : 'Sắp ra mắt'}</span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Cấp độ">
          {LEVELS.map((l) => (
            <Chip key={l} selected={l === level} onClick={() => setSearchParams({ level: l }, { replace: true })}>{l}</Chip>
          ))}
        </div>
        {sets && sets.length > 0 && (
          <p className="text-sm text-radiert">
            Đã xong <span className="font-semibold text-bleistift">{done}</span> / {sets.length} chủ điểm
          </p>
        )}
      </div>

      {!sets && <ListCardSkeleton />}

      {sets && sets.length === 0 && (
        <EmptyState title={`Chủ điểm ${level} đang được soạn`} description="Hiện đã có đủ chủ điểm A1 và A2, bạn luyện các cấp đó trước nhé." />
      )}

      {sets && sets.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {sets.map((s, i) => {
            const complete = s.itemCount > 0 && s.passedCount >= s.itemCount
            const pct = s.itemCount ? Math.round((Math.min(s.passedCount, s.itemCount) / s.itemCount) * 100) : 0
            return (
              <li key={s.id} style={{ '--stagger-index': i % 12 } as CSSProperties} className="stagger-in">
                <CardButton to={`/app/writing/translate/${s.id}`} className="flex h-full flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-bleistift">{s.title}</p>
                      {s.subtitle && <p className="mt-0.5 text-sm text-radiert">{s.subtitle}</p>}
                    </div>
                    {complete && <Badge tone="emph" className="shrink-0">Xong</Badge>}
                  </div>
                  <div className="mt-auto flex items-center gap-3 pt-4">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-rund bg-linie">
                      <div className="h-full rounded-rund bg-bleistift" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="shrink-0 text-xs text-radiert">
                      {Math.min(s.passedCount, s.itemCount)}/{s.itemCount} câu
                    </span>
                  </div>
                </CardButton>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
