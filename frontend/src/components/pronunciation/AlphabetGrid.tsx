import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { Button, CardButton, cn } from '@kit'
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
        <p className="text-sm text-radiert">
          Bấm vào một chữ để nghe và xem cách đọc. Chữ có{' '}
          <span className="rounded-karte border border-dashed border-kante px-1 font-medium text-bleistift">viền chấm</span>{' '}
          đọc khác tiếng Việt - người Việt hay đọc sai.
        </p>
        <Button variant="secondary" size="sm" icon={<Volume2 className="size-4" aria-hidden="true" />}
          onClick={() => speak(LETTERS.map((l) => l.speak).join(', '), { rate: 0.9 })}>
          Nghe cả bảng chữ cái
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {LETTERS.map((l, i) => (
          <CardButton key={l.upper} onClick={() => setOpen(i)}
            className={cn('flex aspect-square flex-col items-center justify-center p-1', l.tricky && 'border-dashed border-kante')}>
            <span className="font-display text-2xl font-bold text-bleistift sm:text-3xl">
              {l.upper}
              <span className="ml-0.5 text-lg font-semibold text-radiert sm:text-xl">{l.lower}</span>
            </span>
            <span className="mt-0.5 text-xs text-radiert">{l.name}</span>
          </CardButton>
        ))}
      </div>

      {open !== null && <DetailSheet items={ITEMS} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />}
    </div>
  )
}
