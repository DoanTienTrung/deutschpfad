import { useEffect, useRef, useState } from 'react'
import type { VocabularyItem } from '../../api/types'
import { questionText, shuffle } from '../../lib/quiz'
import { isCorrectAnswer } from '../../lib/answer'
import AudioBar from './AudioBar'
import Field from '../ui/Field'

const ADVANCE_DELAY_MS = 700

export default function DictationExercise({
  items,
  onComplete,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
}) {
  const [order] = useState(() => shuffle(items))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [attemptFailed, setAttemptFailed] = useState(false)
  const [revealAnswer, setRevealAnswer] = useState(false)
  const [justCorrect, setJustCorrect] = useState(false)
  const [answeredIndexes, setAnsweredIndexes] = useState<Set<number>>(new Set())
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const finished = order.length > 0 && answeredIndexes.size === order.length

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    }
  }, [])

  if (items.length === 0) {
    return <p className="text-muted">Bài học này chưa có từ vựng.</p>
  }

  const current = order[index]

  function goTo(i: number) {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    setIndex(i)
    setInput('')
    setAttemptFailed(false)
    setRevealAnswer(false)
    setJustCorrect(false)
  }

  function handleCheck() {
    if (answeredIndexes.has(index) || !input.trim() || justCorrect) return
    if (isCorrectAnswer(input, current.germanWord)) {
      setAnsweredIndexes((prev) => new Set(prev).add(index))
      setJustCorrect(true)
      advanceTimeoutRef.current = setTimeout(() => {
        if (index < order.length - 1) {
          goTo(index + 1)
        } else {
          setInput('')
          setAttemptFailed(false)
          setRevealAnswer(false)
          setJustCorrect(false)
        }
      }, ADVANCE_DELAY_MS)
    } else if (!attemptFailed) {
      setAttemptFailed(true)
    } else {
      setRevealAnswer(true)
      setInput('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleCheck()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="rounded-sm border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
        >
          ← Câu trước
        </button>
        <p className="text-sm text-muted">
          Đã hoàn thành {answeredIndexes.size}/{order.length}
        </p>
        <button
          onClick={() => goTo(Math.min(order.length - 1, index + 1))}
          disabled={index === order.length - 1}
          className="rounded-sm border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
        >
          Câu sau →
        </button>
      </div>

      <p className="mb-2 font-medium text-ink">Danh sách bài tập:</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {order.map((_, i) => {
          const isCurrent = i === index
          const isDone = answeredIndexes.has(i)
          const stateClass = isCurrent
            ? 'bg-primary text-canvas'
            : isDone
              ? 'border border-success bg-success-bg text-success'
              : 'border border-hairline text-ink hover:bg-surface'
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-9 w-9 rounded-sm text-sm font-medium ${stateClass}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="mb-6 rounded-md border border-hairline bg-white p-6 text-center">
        <AudioBar text={current.germanWord} />

        <div className="mt-4">
          {current.wordType && <p className="text-xs font-medium uppercase text-muted">{current.wordType}</p>}
          <p className="mt-1 text-xl font-bold text-ink">{current.vietnameseMeaning}</p>
          {current.englishMeaning && <p className="mt-1 italic text-muted">= {current.englishMeaning}</p>}
          {current.phonetic && <p className="mt-1 italic text-primary">/{current.phonetic}/</p>}
          {questionText(current) && <p className="mt-3 text-base text-ink">{questionText(current)}</p>}
        </div>

        <div className="mt-4 border-t border-hairline pt-4">
          {!answeredIndexes.has(index) || justCorrect ? (
            <>
              <Field
                id="dictation-answer"
                label="Nghe và gõ lại từ tiếng Đức"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setAttemptFailed(false)
                }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                autoFocus
                readOnly={justCorrect}
                status={justCorrect ? 'success' : attemptFailed ? 'error' : 'default'}
              />
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleCheck}
                  disabled={justCorrect}
                  className="rounded-full border border-primary px-6 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-40"
                >
                  ✓ Check kết quả
                </button>
              </div>
              {justCorrect ? (
                <p className="mt-3 text-sm font-medium text-success">Chính xác!</p>
              ) : revealAnswer ? (
                <p className="mt-3 text-sm font-medium text-danger">
                  Chưa đúng — đáp án là "{current.germanWord}". Gõ lại cho đúng để qua câu mới.
                </p>
              ) : (
                attemptFailed && (
                  <p className="mt-3 text-sm font-medium text-danger">Chưa đúng, thử lại nhé.</p>
                )
              )}
            </>
          ) : (
            <p className="text-sm font-medium text-success">Đã hoàn thành: "{current.germanWord}"</p>
          )}
        </div>
      </div>
    </div>
  )
}
