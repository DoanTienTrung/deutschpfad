import { useEffect, useRef, useState, type RefObject } from 'react'
import type { ListeningSentence } from '../../api/types'
import type { YouTubePlayerRef } from './YouTubePlayer'

const ADVANCE_DELAY_MS = 900
const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

function isLetter(ch: string) {
  return /[a-zA-ZäöüßÄÖÜ]/.test(ch)
}

export default function ListeningDictationPanel({
  sentences,
  playerRef,
  currentTime,
  index,
  onIndexChange,
  onSentenceComplete,
}: {
  sentences: ListeningSentence[]
  playerRef: RefObject<YouTubePlayerRef | null>
  currentTime: number
  index: number
  onIndexChange: (index: number) => void
  onSentenceComplete: (index: number) => void
}) {
  const [typed, setTyped] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [answeredIndexes, setAnsweredIndexes] = useState<Set<number>>(new Set())

  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = sentences[index]
  const letters = current ? current.text.split('').filter(isLetter) : []
  const isComplete = current ? typed.length >= letters.length && letters.length > 0 : false
  const allCorrect = isComplete && typed.every((ch, i) => ch.toLowerCase() === letters[i]?.toLowerCase())

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!current) return
    playerRef.current?.seekTo(current.startSeconds)
    playerRef.current?.play()
    setTyped([])
    setRevealed(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only auto-play when the sentence changes
  }, [index])

  useEffect(() => {
    if (!current) return
    if (currentTime >= current.endSeconds) playerRef.current?.pause()
  }, [currentTime, current, playerRef])

  useEffect(() => {
    if (!allCorrect || !autoAdvance) return
    advanceTimeoutRef.current = setTimeout(() => {
      if (index < sentences.length - 1) goTo(index + 1)
    }, ADVANCE_DELAY_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the all-correct state flips
  }, [allCorrect, autoAdvance])

  useEffect(() => {
    if (allCorrect) {
      setAnsweredIndexes((prev) => new Set(prev).add(index))
      onSentenceComplete(index)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only track when correctness state flips
  }, [allCorrect])

  // Capture keystrokes at the document level instead of relying on a focused input element —
  // a focused <input> can silently lose focus (e.g. to the YouTube iframe once it starts
  // playing), which made typing stop working. Listening on `window` works regardless of which
  // element currently has focus, as long as focus isn't inside the (cross-origin) video iframe.
  function pushChar(char: string) {
    setTyped((prev) => (prev.length < letters.length ? [...prev, char] : prev))
  }

  useEffect(() => {
    if (!current) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Backspace') {
        e.preventDefault()
        setTyped((prev) => prev.slice(0, -1))
        return
      }
      if (e.key.length !== 1) return
      e.preventDefault()
      pushChar(e.key)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pushChar is stable across renders (only reads letters.length via closure, listed below)
  }, [current, letters.length])

  if (!current) return null

  function goTo(i: number) {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    onIndexChange(i)
  }

  function playSegment() {
    playerRef.current?.seekTo(current.startSeconds)
    playerRef.current?.play()
  }

  function handleReveal() {
    setRevealed(true)
    setTyped(letters)
  }

  function handleRetry() {
    setTyped([])
    setRevealed(false)
  }

  let letterIndex = 0
  const renderedChars = current.text.split('').map((ch, i) => {
    if (ch === ' ') {
      return <span key={i} className="inline-block w-4" />
    }
    if (!isLetter(ch)) {
      return (
        <span key={i} className="inline-block px-0.5 text-ink">
          {ch}
        </span>
      )
    }
    const myIndex = letterIndex
    letterIndex += 1
    const typedChar = typed[myIndex]
    const isFilled = typedChar !== undefined
    const isCorrect = isFilled && typedChar.toLowerCase() === ch.toLowerCase()
    const boxClass = !isFilled
      ? 'border-hairline bg-surface text-transparent'
      : isCorrect
        ? 'border-success bg-success-bg text-success'
        : 'border-danger bg-danger-bg text-danger'
    return (
      <span
        key={i}
        className={`mx-0.5 mb-1 inline-flex h-9 w-7 items-center justify-center rounded-sm border text-base font-medium ${boxClass}`}
      >
        {isFilled ? (isCorrect ? ch : typedChar) : '•'}
      </span>
    )
  })

  return (
    <div className="mt-4">
      <div className="rounded-md border border-hairline bg-white p-6">
        <div className="mb-3 flex items-center justify-between text-sm text-muted">
          <span>⌨️ Gõ lại từng chữ nghe được — chữ đúng sẽ tự hiện ra</span>
          <span className="rounded-full border border-hairline px-3 py-1 text-xs font-medium text-ink">
            {typed.length}/{letters.length} chữ
          </span>
        </div>

        <p className={`mb-4 select-none text-lg ${revealed ? 'text-ink' : 'text-muted blur-[3px]'}`}>
          {current.text}
        </p>

        <div className="flex flex-wrap items-center leading-relaxed">{renderedChars}</div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted">Không gõ được dấu?</span>
          {UMLAUT_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => pushChar(key)}
              className="rounded-sm border border-hairline px-2.5 py-1 text-sm font-medium text-ink hover:bg-surface"
            >
              {key}
            </button>
          ))}
          <button
            onClick={() => setTyped((prev) => prev.slice(0, -1))}
            className="rounded-sm border border-hairline px-2.5 py-1 text-sm font-medium text-ink hover:bg-surface"
          >
            ⌫ Xoá
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={handleReveal}
            className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            👀 Hiện đáp án
          </button>
          <button
            onClick={handleRetry}
            className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            ↻ Làm lại
          </button>
          <button
            onClick={playSegment}
            className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            ▶ Nghe lại
          </button>
        </div>

        {isComplete && (
          <p className={`mt-3 text-center text-sm font-medium ${allCorrect ? 'text-success' : 'text-danger'}`}>
            {revealed
              ? `Đáp án: "${current.text}"`
              : allCorrect
                ? 'Chính xác!'
                : 'Còn chỗ sai (tô đỏ) — xoá và gõ lại cho đúng, hoặc bấm Câu sau để bỏ qua.'}
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 items-center gap-2">
        <button
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="rounded-sm border border-hairline px-3 py-2 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
        >
          ⏮ Câu trước
        </button>

        <label className="flex cursor-pointer items-center justify-center gap-2 text-sm font-medium text-ink">
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoAdvance ? 'bg-primary' : 'bg-hairline'}`}>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoAdvance ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </span>
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
            className="sr-only"
          />
          Tự động chuyển câu
        </label>

        <button
          onClick={() => goTo(Math.min(sentences.length - 1, index + 1))}
          disabled={index === sentences.length - 1}
          className="rounded-sm border border-hairline px-3 py-2 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
        >
          Câu sau ⏭
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-muted">
        Đã hoàn thành {answeredIndexes.size}/{sentences.length} câu
      </p>
    </div>
  )
}
