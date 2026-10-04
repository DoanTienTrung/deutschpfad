import { useState } from 'react'
import { SOUNDS } from '../../lib/pronunciation'
import DetailSheet, { type DetailItem } from './DetailSheet'

// Âm ghép không có "tên" để đọc riêng như chữ cái, nên loa đọc từ ví dụ đầu tiên.
const ITEMS: DetailItem[] = SOUNDS.map((s) => ({
  key: s.id,
  title: s.label.split(' (')[0],
  subtitle: s.label.includes('(') ? s.label.slice(s.label.indexOf('(')) : undefined,
  ipa: s.ipa,
  speak: s.examples[0].word,
  sound: s.sound,
  tip: s.tip,
  examples: s.examples,
}))

export default function SoundRules() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Người mới học ít khi đọc sai từng chữ cái - mà hay sai khi các chữ đi cùng nhau: <strong className="text-ink">Wein</strong>{' '}
        đọc "vain", không phải "ve-in". Đây là những cụm và quy tắc cần nắm sớm nhất.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SOUNDS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setOpen(i)}
            className="flex min-h-36 flex-col rounded-lg border border-hairline bg-card p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <span className="font-display text-2xl font-bold text-ink">{s.label.split(' (')[0]}</span>
            <span className="mt-0.5 min-h-4 text-xs text-muted">
              {s.label.includes('(') ? s.label.slice(s.label.indexOf('(') + 1, -1) : `/${s.ipa}/`}
            </span>
            <span className="mt-3 line-clamp-3 text-sm text-ink">{s.sound}</span>
          </button>
        ))}
      </div>

      {open !== null && <DetailSheet items={ITEMS} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />}
    </div>
  )
}
