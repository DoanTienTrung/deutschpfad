import { useEffect, useRef, type ReactNode, type TouchEvent } from 'react'
import { ArrowLeft, ArrowRight, Snail, Volume2 } from 'lucide-react'
import { BottomSheet, Button, IconButton } from '@kit'
import { speak } from '../../lib/speech'
import type { Example } from '../../lib/pronunciation'
import { markAlphabetVisited } from '../../lib/onboarding'

export type DetailItem = {
  key: string
  /** Chữ hiện to ("Ü ü", "sch") */
  title: string
  /** Dòng phụ dưới chữ to ("tên chữ: ü") */
  subtitle?: string
  ipa: string
  /** Chuỗi cho giọng đọc khi bấm loa */
  speak: string
  sound: string
  tip?: string
  examples: Example[]
}

function SpeakButton({ text, rate = 1, icon, children }: { text: string; rate?: number; icon: ReactNode; children: ReactNode }) {
  return (
    <Button variant="secondary" size="sm" icon={icon} onClick={() => speak(text, { rate })}>
      {children}
    </Button>
  )
}

/**
 * Thẻ phóng to của một chữ cái / âm ghép. Điện thoại: trượt lên từ đáy (vuốt ngang để sang chữ khác);
 * máy tính: hộp giữa màn hình (phím ← → để chuyển, Esc để đóng). Tự đọc khi mở hoặc đổi chữ — người
 * học vừa bấm vào chữ đó, nên nghe ngay là điều họ chờ.
 */
export default function DetailSheet({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: DetailItem[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const item = items[index]
  const touchX = useRef<number | null>(null)
  const hasPrev = index > 0
  const hasNext = index < items.length - 1

  useEffect(() => {
    speak(item.speak)
  }, [item.speak])

  useEffect(() => markAlphabetVisited(), [])

  useEffect(() => {
    // Esc do hộp thoại tự xử lý (đóng); ở đây chỉ còn mũi tên để chuyển chữ.
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && hasPrev) onIndexChange(index - 1)
      if (e.key === 'ArrowRight' && hasNext) onIndexChange(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, hasPrev, hasNext, onIndexChange])

  function onTouchEnd(e: TouchEvent) {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (dx > 50 && hasPrev) onIndexChange(index - 1)
    if (dx < -50 && hasNext) onIndexChange(index + 1)
  }

  return (
    <BottomSheet open onClose={onClose} title={<span className="text-sm font-normal tabular-nums text-radiert">{index + 1}/{items.length}</span>}>
      <div onTouchStart={(e) => (touchX.current = e.touches[0].clientX)} onTouchEnd={onTouchEnd}>
        <div className="text-center">
          <p className="font-display text-5xl font-bold text-bleistift">{item.title}</p>
          {item.subtitle && <p className="mt-2 text-base text-radiert">{item.subtitle}</p>}
          <p className="mt-1 font-mono text-sm text-radiert">/{item.ipa}/</p>
          <div className="mt-4 flex justify-center gap-2">
            <SpeakButton text={item.speak} icon={<Volume2 className="size-4" aria-hidden="true" />}>Nghe</SpeakButton>
            <SpeakButton text={item.speak} rate={0.6} icon={<Snail className="size-4" aria-hidden="true" />}>Chậm</SpeakButton>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-radiert uppercase">Cách đọc</p>
            <p className="mt-1 text-base text-bleistift">{item.sound}</p>
          </div>
          {item.tip && (
            <div className="rounded-karte border border-linie bg-karteikarte-innen px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-radiert uppercase">Dễ nhầm</p>
              <p className="mt-1 text-bleistift">{item.tip}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium tracking-wide text-radiert uppercase">Ví dụ</p>
            <ul className="mt-1 space-y-1">
              {item.examples.map((ex) => (
                <li key={ex.word} className="flex items-center gap-2">
                  <IconButton label={`Nghe ${ex.word}`} icon={<Volume2 className="size-4" aria-hidden="true" />} onClick={() => speak(ex.word)} />
                  <span className="font-display text-lg font-semibold text-bleistift">{ex.word}</span>
                  <span className="text-radiert">- {ex.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <IconButton variant="secondary" label="Chữ trước" icon={<ArrowLeft className="size-4" aria-hidden="true" />}
            onClick={() => onIndexChange(index - 1)} disabled={!hasPrev} />
          <p className="hidden text-xs text-radiert sm:block">Dùng phím mũi tên trái/phải để chuyển</p>
          <p className="text-xs text-radiert sm:hidden">Vuốt ngang để chuyển</p>
          <IconButton variant="secondary" label="Chữ sau" icon={<ArrowRight className="size-4" aria-hidden="true" />}
            onClick={() => onIndexChange(index + 1)} disabled={!hasNext} />
        </div>
      </div>
    </BottomSheet>
  )
}
