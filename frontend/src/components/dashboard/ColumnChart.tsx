export type Column = {
  key: string
  /** Nhãn dưới cột; chuỗi rỗng = không ghi (tránh chen chúc khi có 14 cột) */
  label: string
  value: number
  /** Cột được tô màu nhấn (vd. ngày đạt mục tiêu) */
  highlight?: boolean
  /** Ghi giá trị trên đầu cột - chỉ vài cột đáng chú ý, không ghi tất cả */
  showValue?: boolean
  tooltip: string
}

/**
 * Biểu đồ cột một chuỗi số liệu, dựng bằng HTML/CSS (không cần thư viện, tự co theo chiều ngang).
 * Theo quy ước dataviz của dự án: cột tối đa 24px, bo 4px ở đầu, vuông ở đáy, một đường gốc; vạch
 * tham chiếu (mục tiêu) là đường mảnh liền; chỉ vài cột có số trên đầu, phần còn lại xem bằng tooltip
 * (di chuột hoặc Tab tới cột); có bảng ẩn cho trình đọc màn hình.
 */
export default function ColumnChart({
  columns,
  caption,
  reference,
  highlightClass = 'bg-accent',
  baseClass = 'bg-bar-muted',
  formatValue = (v) => String(v),
  height = 128,
}: {
  columns: Column[]
  caption: string
  /** Vạch tham chiếu (vd. mục tiêu). Chú thích của vạch đặt ở dòng chú giải bên dưới, không trong vùng vẽ. */
  reference?: { value: number }
  highlightClass?: string
  baseClass?: string
  formatValue?: (v: number) => string
  height?: number
}) {
  const max = Math.max(1, reference?.value ?? 0, ...columns.map((c) => c.value))
  const pct = (v: number) => `${(v / max) * 100}%`

  return (
    <figure>
      <div className="relative" style={{ height }}>
        {reference && (
          <div className="pointer-events-none absolute inset-x-0 z-10 border-t border-ink/40" style={{ bottom: pct(reference.value) }} />
        )}
        <div className="absolute inset-0 flex items-end gap-0.5 border-b border-hairline">
          {columns.map((c) => (
            <div
              key={c.key}
              tabIndex={0}
              aria-label={c.tooltip}
              className="group relative flex h-full flex-1 items-end justify-center outline-none"
            >
              {c.showValue && c.value > 0 && (
                <span
                  className="absolute z-10 text-xs font-semibold text-ink"
                  style={{ bottom: `calc(${pct(c.value)} + 4px)` }}
                >
                  {formatValue(c.value)}
                </span>
              )}
              <div
                className={`w-full max-w-6 rounded-t-[4px] transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80 ${
                  c.highlight ? highlightClass : baseClass
                }`}
                style={{ height: c.value > 0 ? `max(${pct(c.value)}, 3px)` : 0 }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-primary px-2 py-1 text-xs text-canvas shadow-floating group-hover:block group-focus-visible:block">
                {c.tooltip}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Nhãn được phép tràn ra ngoài bề rộng cột (cột hẹp trên điện thoại); nhãn ở hai đầu bám mép
          trong để không tràn khỏi biểu đồ. */}
      <div className="relative mt-1.5 flex h-4 gap-0.5">
        {columns.map((c, i) => (
          <span key={c.key} className="relative flex-1">
            {c.label && (
              <span
                className={`absolute whitespace-nowrap text-xs text-muted ${
                  i === 0 ? 'left-0' : i === columns.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                }`}
              >
                {c.label}
              </span>
            )}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {columns.map((c) => (
            <tr key={c.key}>
              <td>{c.tooltip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
