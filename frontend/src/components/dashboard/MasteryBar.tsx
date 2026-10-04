const STAGES = [
  { key: 'notYet', label: 'Chưa nhớ', hint: 'mới gặp hoặc vừa quên', className: 'bg-m1' },
  { key: 'learning', label: 'Đang học', hint: 'nhớ được 1 lần', className: 'bg-m2' },
  { key: 'known', label: 'Đã thuộc', hint: 'nhớ đúng từ 2 lần', className: 'bg-m3' },
  { key: 'longTerm', label: 'Nhớ lâu', hint: 'lịch ôn cách từ 3 tuần', className: 'bg-m4' },
] as const

export type MasteryCounts = Record<(typeof STAGES)[number]['key'], number>

/**
 * Thanh xếp chồng: các từ đang ở mức nhớ nào. Bốn bậc của CÙNG một màu, nhạt → đậm theo mức nhớ, ngăn
 * nhau bằng khe 2px màu nền (không viền). Chú thích luôn có (không để màu tự nói), số đếm nằm ở chú
 * thích chứ không nhét vào trong đoạn thanh (đoạn hẹp sẽ không đủ chỗ).
 */
export default function MasteryBar({ counts }: { counts: MasteryCounts }) {
  const total = STAGES.reduce((sum, s) => sum + counts[s.key], 0)
  if (total === 0) return null

  return (
    <div>
      <div className="flex h-4 gap-0.5 overflow-hidden rounded-sm" role="img" aria-label={STAGES.map((s) => `${s.label}: ${counts[s.key]}`).join(', ')}>
        {STAGES.map((s) =>
          counts[s.key] > 0 ? (
            <div
              key={s.key}
              className={`${s.className} min-w-1 first:rounded-l-sm last:rounded-r-sm`}
              style={{ flexGrow: counts[s.key] }}
              title={`${s.label}: ${counts[s.key]} từ`}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {STAGES.map((s) => (
          <li key={s.key} className="flex items-start gap-2">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-sm ${s.className}`} aria-hidden="true" />
            <span>
              <span className="block text-sm text-ink">
                <span className="font-semibold">{counts[s.key]}</span> {s.label.toLowerCase()}
              </span>
              <span className="block text-xs text-muted">{s.hint}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
