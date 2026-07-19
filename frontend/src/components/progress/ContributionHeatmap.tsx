import { useEffect, useMemo, useRef, useState } from 'react'
import type { HeatmapDay } from '../../api/types'

const CELL_GAP = 3
const CELL_SIZE = 11
const MAX_WEEKS = 53
const MIN_WEEKS = 8
// Estimated width of the weekday-label column ("Th 2" in text-xs) plus its gap.
const LABEL_COL_WIDTH = 40
// A month label ("Th 12") spans ~2.5 cell columns; require this many columns of clearance so
// neighboring labels never draw on top of each other and the last one never clips off the edge.
const MIN_LABEL_COLS = 3
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
  weeks,
}: {
  data: HeatmapDay[]
  weeks?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fitWeeks, setFitWeeks] = useState(MAX_WEEKS)

  // Cells are fixed-size (so they never shrink to slivers); instead the number of visible weeks
  // adapts to the container -- a wide desktop card shows the full year, a phone shows fewer
  // weeks, and neither leaves the card half-empty or forces horizontal scrolling.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const compute = () => {
      const available = el.clientWidth - LABEL_COL_WIDTH
      const fit = Math.floor((available + CELL_GAP) / (CELL_SIZE + CELL_GAP))
      setFitWeeks(Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, fit)))
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial measure before first paint
    compute()
    const observer = new ResizeObserver(compute)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const weekCount = weeks ?? fitWeeks

  const { weekColumns, monthMarkers } = useMemo(() => {
    const countByDate = new Map(data.map((d) => [d.date, d.count]))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()))
    const start = new Date(endOfWeek)
    start.setDate(endOfWeek.getDate() - weekCount * 7 + 1)

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

    const raw: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    columns.forEach((col, i) => {
      const month = new Date(col[0].date).getMonth()
      if (month !== lastMonth) {
        raw.push({ weekIndex: i, label: MONTH_LABELS[month] })
        lastMonth = month
      }
    })

    // Column 0 is almost always a partial month; when the next month starts within the label's
    // own width, drop the partial one -- otherwise the two draw on top of each other ("ThTh 2").
    if (raw.length >= 2 && raw[0].weekIndex === 0 && raw[1].weekIndex < MIN_LABEL_COLS) {
      raw.shift()
    }

    const markers: typeof raw = []
    let lastMarkerIndex = -Infinity
    for (const m of raw) {
      if (m.weekIndex - lastMarkerIndex < MIN_LABEL_COLS) continue // would overlap previous label
      if (m.weekIndex > columns.length - MIN_LABEL_COLS) continue // would clip past the right edge
      markers.push(m)
      lastMarkerIndex = m.weekIndex
    }

    return { weekColumns: columns, monthMarkers: markers }
  }, [data, weekCount])

  // Fixed cell size (not minmax(0,1fr)) so cells never shrink to illegible slivers -- the week
  // count adapts to the measured container width instead (overflow-x-auto stays as a fallback
  // for the frame between first render and the initial measurement).
  const gridStyle = { gridTemplateColumns: `repeat(${weekCount}, ${CELL_SIZE}px)`, gap: CELL_GAP }
  const gridWidth = weekCount * CELL_SIZE + (weekCount - 1) * CELL_GAP

  return (
    <div ref={containerRef}>
      <div className="flex gap-2 overflow-x-auto">
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

        <div className="shrink-0" style={{ width: gridWidth }}>
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
        </div>
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
  )
}
