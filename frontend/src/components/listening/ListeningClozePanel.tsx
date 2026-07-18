import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { ListeningSentence } from '../../api/types'
import type { YouTubePlayerRef } from './YouTubePlayer'

const ADVANCE_DELAY_MS = 900
const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

type Difficulty = 'easy' | 'hard'

const STOPWORDS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
  'und', 'ist', 'sind', 'war', 'waren', 'hat', 'habe', 'hast', 'habt', 'haben',
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sich', 'mich', 'dich', 'uns', 'euch',
  'in', 'zu', 'mit', 'auf', 'für', 'von', 'an', 'im', 'am', 'als', 'so', 'aber', 'oder',
  'nicht', 'auch', 'nur', 'noch', 'schon', 'sehr', 'mehr', 'kein', 'keine', 'keinen',
  'dass', 'wenn', 'wie', 'was', 'wer', 'wo', 'warum', 'zum', 'zur', 'bei', 'nach', 'vor',
  'über', 'unter', 'durch', 'ohne', 'um', 'aus', 'dann', 'da', 'doch', 'ja', 'nein',
])

function tokenize(text: string): string[] {
  return text.match(/[A-Za-zäöüßÄÖÜ]+|[^A-Za-zäöüßÄÖÜ]+/g) ?? []
}

function isWordToken(token: string) {
  return /^[A-Za-zäöüßÄÖÜ]+$/.test(token)
}

function pickBlankIndexes(tokens: string[], difficulty: Difficulty): Set<number> {
  const candidates = tokens
    .map((token, i) => ({ token, i }))
    .filter(({ token }) => isWordToken(token) && token.length >= 3 && !STOPWORDS.has(token.toLowerCase()))

  if (candidates.length === 0) return new Set()

  const count = difficulty === 'easy' ? 1 : Math.min(candidates.length, 2 + Math.round(Math.random()))
  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  return new Set(shuffled.slice(0, count).map((c) => c.i))
}

export default function ListeningClozePanel({
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
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [revealed, setRevealed] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [answeredIndexes, setAnsweredIndexes] = useState<Set<number>>(new Set())
  const [focusedBlank, setFocusedBlank] = useState<number | null>(null)

  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const current = sentences[index]
  const tokens = useMemo(() => (current ? tokenize(current.text) : []), [current])
  const blankIndexes = useMemo(
    () => pickBlankIndexes(tokens, difficulty),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reshuffle blanks when the sentence or difficulty changes
    [current?.id, difficulty],
  )

  const allCorrect =
    blankIndexes.size > 0 &&
    [...blankIndexes].every((i) => (answers[i] ?? '').trim().toLowerCase() === tokens[i].toLowerCase())

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!current) return
    playerRef.current?.seekTo(current.startSeconds)
    playerRef.current?.play()
    setAnswers({})
    setRevealed(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only auto-play when the sentence changes
  }, [index])

  useEffect(() => {
    if (!current) return
    // Last sentence's endSeconds is a synthetic "+5s" placeholder, often shorter than the real
    // clip — don't cut playback short there since there's no next sentence to advance into.
    const isLastSentence = index === sentences.length - 1
    if (!isLastSentence && currentTime >= current.endSeconds) playerRef.current?.pause()
  }, [currentTime, current, playerRef, index, sentences.length])

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
    const filled: Record<number, string> = {}
    blankIndexes.forEach((i) => {
      filled[i] = tokens[i]
    })
    setAnswers(filled)
  }

  function handleRetry() {
    setAnswers({})
    setRevealed(false)
  }

  function insertChar(char: string) {
    if (focusedBlank === null) return
    const input = inputRefs.current[focusedBlank]
    const value = answers[focusedBlank] ?? ''
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    const next = value.slice(0, start) + char + value.slice(end)
    setAnswers((prev) => ({ ...prev, [focusedBlank]: next }))
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + char.length, start + char.length)
    })
  }

  return (
    <div className="mt-4">
      <div className="rounded-md border border-hairline bg-white p-6">
        <div className="mb-3 flex items-center justify-between text-sm text-muted">
          <span>✏️ Điền từ còn thiếu vào chỗ trống</span>
          <div className="flex gap-1">
            <button
              onClick={() => setDifficulty('easy')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                difficulty === 'easy' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
              }`}
            >
              Dễ
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                difficulty === 'hard' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
              }`}
            >
              Khó
            </button>
          </div>
        </div>

        <p className="mb-2 text-lg leading-loose text-ink">
          {tokens.map((token, i) => {
            if (!blankIndexes.has(i)) return <span key={i}>{token}</span>

            const value = answers[i] ?? ''
            const isCorrect = value.trim().toLowerCase() === token.toLowerCase()
            const boxClass =
              value.length === 0
                ? 'border-hairline bg-surface'
                : isCorrect
                  ? 'border-success bg-success-bg text-success'
                  : 'border-danger bg-danger-bg text-danger'

            return (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el
                }}
                value={value}
                disabled={revealed}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                onFocus={() => setFocusedBlank(i)}
                style={{ width: `${Math.max(token.length, 3) + 2}ch` }}
                className={`mx-1 inline-block rounded-sm border px-1 py-0.5 text-center text-base font-medium outline-none focus:border-primary ${boxClass}`}
              />
            )
          })}
        </p>

        {blankIndexes.size > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-muted">Không gõ được dấu?</span>
            {UMLAUT_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => insertChar(key)}
                disabled={focusedBlank === null || revealed}
                className="rounded-sm border border-hairline px-2.5 py-1 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
              >
                {key}
              </button>
            ))}
          </div>
        )}

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

        {allCorrect && (
          <p className="mt-3 text-center text-sm font-medium text-success">Chính xác!</p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 items-center gap-2 sm:grid-cols-3">
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
