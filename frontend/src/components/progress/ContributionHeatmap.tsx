import { useMemo } from 'react'
import type { HeatmapDay } from '../../api/types'

const CELL_GAP = 3
const DEFAULT_WEEKS = 53
const WEEKDAY_LABELS = ['', 'Th 2', '', 'Th 4', '', 'Th 6', '']
const MONTH_LABELS = [
  'Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12',
]

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function tierClass(count: number) {
  if (count <= 0) return 'bg-hairline'
  if (count === 1) return 'bg-accent/35'
  if (count <= 3) return 'bg-accent/60'
  if (count <= 5) return 'bg-accent/85'
  return 'bg-accent'
}

type Cell = { date: string; count: number; isFuture: boolean }

export default function ContributionHeatmap({
  data,
  weeks = DEFAULT_WEEKS,
}: {
  data: HeatmapDay[]
  weeks?: number
}) {
  const { weekColumns, monthMarkers } = useMemo(() => {
    const countByDate = new Map(data.map((d) => [d.date, d.count]))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
    const start = new Date(endOfWeek)
    start.setDate(endOfWeek.getDate() - weeks * 7 + 1)

    const columns: Cell[][] = []
    let column: Cell[] = []
    const cursor = new Date(start)
    while (cursor <= endOfWeek) {
      const iso = toIsoDate(cursor)
      column.push({ date: iso, count: countByDate.get(iso) ?? 0, isFuture: cursor > today })
      if (column.length === 7) {
        columns.push(column)
        column = []
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    const markers: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    columns.forEach((col, i) => {
      const month = new Date(col[0].date).getMonth()
      if (month !== lastMonth) {
        markers.push({ weekIndex: i, label: MONTH_LABELS[month] })
        lastMonth = month
      }
    })

    return { weekColumns: columns, monthMarkers: markers }
  }, [data, weeks])

  const gridStyle = { gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`, gap: CELL_GAP }

  return (
    <div>
      <div className="flex gap-2">
        <div
          className="flex shrink-0 flex-col justify-between text-xs text-muted"
          style={{ marginTop: 18, paddingBottom: 2 }}
        >
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} className="leading-none">
              {label}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative mb-1 grid h-4 text-xs text-muted" style={gridStyle}>
            {weekColumns.map((_, i) => (
              <span key={i} className="relative overflow-visible whitespace-nowrap leading-none">
                {monthMarkers.find((m) => m.weekIndex === i)?.label ?? ''}
              </span>
            ))}
          </div>

          <div className="flex flex-col" style={{ gap: CELL_GAP }}>
            {Array.from({ length: 7 }).map((_, dayOfWeek) => (
              <div key={dayOfWeek} className="grid" style={gridStyle}>
                {weekColumns.map((col) => {
                  const cell = col[dayOfWeek]
                  return cell.isFuture ? (
                    <div key={cell.date} className="aspect-square" />
                  ) : (
                    <div
                      key={cell.date}
                      title={`${cell.date}: ${cell.count} bài học hoàn thành`}
                      className={`aspect-square rounded-[2px] ${tierClass(cell.count)}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-end gap-1 text-xs text-muted">
            <span>Ít hơn</span>
            <div className="h-3 w-3 rounded-[2px] bg-hairline" />
            <div className="h-3 w-3 rounded-[2px] bg-accent/35" />
            <div className="h-3 w-3 rounded-[2px] bg-accent/60" />
            <div className="h-3 w-3 rounded-[2px] bg-accent/85" />
            <div className="h-3 w-3 rounded-[2px] bg-accent" />
            <span>Nhiều hơn</span>
          </div>
        </div>
      </div>
    </div>
  )
}
