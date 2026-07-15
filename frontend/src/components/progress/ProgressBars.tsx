import type { ProgressSummary } from '../../api/types'

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1']

function sortByLevel(items: ProgressSummary[]) {
  return [...items].sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level))
}

function ProgressGroup({ title, items }: { title: string; items: ProgressSummary[] }) {
  if (items.length === 0) return null

  return (
    <div>
      <p className="mb-2 font-display text-sm font-semibold text-ink">{title}</p>
      <div className="space-y-2">
        {sortByLevel(items).map((item) => {
          const percent = item.totalLessons === 0 ? 0 : Math.round((item.completedLessons / item.totalLessons) * 100)
          return (
            <div key={item.level} className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-sm font-medium text-ink">{item.level}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-hairline">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-28 shrink-0 text-right text-xs text-muted">
                {percent}% ({item.completedLessons}/{item.totalLessons} bài)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProgressBars({ summary }: { summary: ProgressSummary[] }) {
  const frequency = summary.filter((s) => s.source === 'FREQUENCY')
  const goethe = summary.filter((s) => s.source === 'GOETHE')

  if (frequency.length === 0 && goethe.length === 0) {
    return <p className="text-sm text-muted">Chưa có dữ liệu tiến độ.</p>
  }

  return (
    <div className="space-y-5">
      <ProgressGroup title="Từ vựng tần suất cao" items={frequency} />
      <ProgressGroup title="Ôn thi Goethe" items={goethe} />
    </div>
  )
}
