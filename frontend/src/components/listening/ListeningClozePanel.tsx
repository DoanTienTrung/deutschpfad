import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Eye, PencilLine, Play, RotateCcw, SkipBack } from 'lucide-react'
import { BlankInput, Button, Segmented, Switch } from '@kit'
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đổi câu thì xoá các ô đã điền
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đánh dấu câu xong ngay khi mọi ô đều đúng
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
      <div className="rounded-karte border border-kartenrand bg-karteikarte p-6">
        <div className="mb-3 flex items-center justify-between text-sm text-radiert">
          <span className="inline-flex items-center gap-1.5"><PencilLine className="size-4" aria-hidden="true" /> Điền từ còn thiếu vào chỗ trống</span>
          <Segmented label="Độ khó" value={difficulty} onChange={(v) => setDifficulty(v as 'easy' | 'hard')}
            options={[{ value: 'easy', label: 'Dễ' }, { value: 'hard', label: 'Khó' }]} />
        </div>

        <p className="mb-2 text-lg leading-loose text-bleistift">
          {tokens.map((token, i) => {
            if (!blankIndexes.has(i)) return <span key={i}>{token}</span>

            const value = answers[i] ?? ''
            const isCorrect = value.trim().toLowerCase() === token.toLowerCase()
            return (
              <BlankInput key={i} ref={(el) => { inputRefs.current[i] = el }} value={value} disabled={revealed}
                aria-label={`Chỗ trống ${i + 1}`} chars={Math.max(token.length, 3)}
                state={value.length === 0 ? 'empty' : isCorrect ? 'correct' : 'wrong'}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))} onFocus={() => setFocusedBlank(i)} />
            )
          })}
        </p>

        {blankIndexes.size > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-radiert">Không gõ được dấu?</span>
            {UMLAUT_KEYS.map((key) => (
              <Button variant="secondary" size="sm" className="disabled:opacity-40"
                key={key}
                onClick={() => insertChar(key)}
                disabled={focusedBlank === null || revealed}>
                {key}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="secondary" icon={<Eye className="size-4" aria-hidden="true" />}
            onClick={handleReveal}>
            Hiện đáp án
          </Button>
          <Button variant="secondary" icon={<RotateCcw className="size-4" aria-hidden="true" />} onClick={handleRetry}>Làm lại</Button>
          <Button variant="secondary" icon={<Play className="size-4" aria-hidden="true" />}
            onClick={playSegment}>
            Nghe lại
          </Button>
        </div>

        {allCorrect && (
          <p className="mt-3 text-center text-sm font-medium text-aufstieg">Chính xác!</p>
        )}
      </div>

      {/* Mobile: nav buttons side by side, toggle on its own row below. Desktop: sm:contents
          dissolves the wrapper so its 2 children rejoin the grid directly, with sm:order-3
          putting "Câu sau" back after the toggle -- same 3-column layout as before. */}
      <div className="mt-3 flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-center sm:gap-2">
        <div className="flex items-center justify-between gap-2 sm:contents">
          <Button variant="secondary" icon={<SkipBack className="size-4" aria-hidden="true" />} className="disabled:opacity-40"
            onClick={() => goTo(Math.max(0, index - 1))}
            disabled={index === 0}>
            Câu trước
          </Button>

          <Button variant="secondary" className="disabled:opacity-40 sm:order-3"
            onClick={() => goTo(Math.min(sentences.length - 1, index + 1))}
            disabled={index === sentences.length - 1}>
            Câu sau ⏭
          </Button>
        </div>

        <Switch checked={autoAdvance} onChange={setAutoAdvance} label="Tự động chuyển câu" className="mx-auto max-w-64" />
      </div>

      <p className="mt-2 text-center text-xs text-radiert">
        Đã hoàn thành {answeredIndexes.size}/{sentences.length} câu
      </p>
    </div>
  )
}
