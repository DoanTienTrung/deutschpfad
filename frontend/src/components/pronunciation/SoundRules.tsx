import { useState } from 'react'
import { CardButton } from '@kit'
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
      <p className="mb-4 text-sm text-radiert">
        Người mới học ít khi đọc sai từng chữ cái - mà hay sai khi các chữ đi cùng nhau: <strong className="text-bleistift">Wein</strong>{' '}
        đọc "vain", không phải "ve-in". Đây là những cụm và quy tắc cần nắm sớm nhất.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SOUNDS.map((s, i) => (
          <CardButton key={s.id} onClick={() => setOpen(i)} className="flex min-h-36 flex-col">
            <span className="font-display text-2xl font-bold text-bleistift">{s.label.split(' (')[0]}</span>
            <span className="mt-0.5 min-h-4 text-xs text-radiert">
              {s.label.includes('(') ? s.label.slice(s.label.indexOf('(') + 1, -1) : `/${s.ipa}/`}
            </span>
            <span className="mt-3 line-clamp-3 text-sm text-bleistift">{s.sound}</span>
          </CardButton>
        ))}
      </div>

      {open !== null && <DetailSheet items={ITEMS} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />}
    </div>
  )
}
