import { useState } from 'react'
import { LETTERS } from '../../lib/pronunciation'
import { speak } from '../../lib/speech'
import DetailSheet, { type DetailItem } from './DetailSheet'

const ITEMS: DetailItem[] = LETTERS.map((l) => ({
  key: l.upper,
  title: `${l.upper} ${l.lower}`,
  subtitle: `Tên chữ: ${l.name}`,
  ipa: l.ipa,
  speak: l.speak,
  sound: l.sound,
  tip: l.tip,
  examples: l.examples,
}))

export default function AlphabetGrid() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Bấm vào một chữ để nghe và xem cách đọc. Chữ có{' '}
          <span className="rounded-sm border border-dashed border-ink/40 px-1 font-medium text-ink">viền chấm</span>{' '}
          đọc khác tiếng Việt - người Việt hay đọc sai.
        </p>
        <button
          onClick={() => speak(LETTERS.map((l) => l.speak).join(', '), { rate: 0.9 })}
          className="rounded-full border border-hairline bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          🔊 Nghe cả bảng chữ cái
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {LETTERS.map((l, i) => (
          <button
            key={l.upper}
            onClick={() => setOpen(i)}
            className={`flex aspect-square flex-col items-center justify-center rounded-lg bg-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted ${
              l.tricky ? 'border border-dashed border-ink/40' : 'border border-hairline'
            }`}
          >
            <span className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {l.upper}
              <span className="ml-0.5 text-lg font-semibold text-muted sm:text-xl">{l.lower}</span>
            </span>
            <span className="mt-0.5 text-xs text-muted">{l.name}</span>
          </button>
        ))}
      </div>

      {open !== null && <DetailSheet items={ITEMS} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />}
    </div>
  )
}
