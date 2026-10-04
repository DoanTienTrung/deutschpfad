import { useEffect, useRef } from 'react'
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

function SpeakButton({ text, rate = 1, label, children }: { text: string; rate?: number; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={() => speak(text, { rate })}
      aria-label={label}
      title={label}
      className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-hairline bg-card px-3 text-ink transition-colors hover:bg-surface"
    >
      {children}
    </button>
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
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onIndexChange(index - 1)
      if (e.key === 'ArrowRight' && hasNext) onIndexChange(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, hasPrev, hasNext, onIndexChange, onClose])

  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (dx > 50 && hasPrev) onIndexChange(index - 1)
    if (dx < -50 && hasNext) onIndexChange(index + 1)
  }

  const navButton =
    'flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-lg text-ink transition-colors hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-card p-6 shadow-floating sm:max-w-lg sm:rounded-lg"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm tabular-nums text-muted">
            {index + 1}/{items.length}
          </p>
          <button onClick={onClose} aria-label="Đóng" className="rounded-sm p-1.5 text-muted hover:text-ink">
            ✕
          </button>
        </div>

        <div className="mt-2 text-center">
          <p className="font-display text-6xl font-bold text-ink">{item.title}</p>
          {item.subtitle && <p className="mt-2 text-base text-muted">{item.subtitle}</p>}
          <p className="mt-1 font-mono text-sm text-muted">/{item.ipa}/</p>
          <div className="mt-4 flex justify-center gap-2">
            <SpeakButton text={item.speak} label="Nghe">
              🔊 <span className="text-sm font-medium">Nghe</span>
            </SpeakButton>
            <SpeakButton text={item.speak} rate={0.6} label="Nghe chậm">
              🐢 <span className="text-sm font-medium">Chậm</span>
            </SpeakButton>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Cách đọc</p>
            <p className="mt-1 text-ink">{item.sound}</p>
          </div>
          {item.tip && (
            <div className="rounded-md bg-surface px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Dễ nhầm</p>
              <p className="mt-1 text-sm text-ink">{item.tip}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Ví dụ</p>
            <ul className="mt-2 space-y-2">
              {item.examples.map((ex) => (
                <li key={ex.word} className="flex items-center gap-3">
                  <button
                    onClick={() => speak(ex.word)}
                    aria-label={`Nghe ${ex.word}`}
                    className="shrink-0 rounded-full p-1.5 text-primary hover:bg-surface"
                  >
                    🔊
                  </button>
                  <span className="font-display text-lg font-semibold text-ink">{ex.word}</span>
                  <span className="text-sm text-muted">- {ex.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => onIndexChange(index - 1)} disabled={!hasPrev} aria-label="Chữ trước" className={navButton}>
            ←
          </button>
          <p className="hidden text-xs text-muted sm:block">Dùng phím ← → để chuyển</p>
          <p className="text-xs text-muted sm:hidden">Vuốt ngang để chuyển</p>
          <button onClick={() => onIndexChange(index + 1)} disabled={!hasNext} aria-label="Chữ sau" className={navButton}>
            →
          </button>
        </div>
      </div>
    </div>
  )
}
