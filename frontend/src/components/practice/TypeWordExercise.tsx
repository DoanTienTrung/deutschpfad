import { useEffect, useRef, useState } from 'react'
import type { VocabularyItem } from '../../api/types'
import { questionDisplay, shuffle } from '../../lib/quiz'
import { isCorrectAnswer } from '../../lib/answer'
import Field from '../ui/Field'
import QuestionSentence from './QuestionSentence'

const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

export default function TypeWordExercise({
  items,
  onComplete,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
}) {
  const [order] = useState(() => shuffle(items))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [revealAnswer, setRevealAnswer] = useState(false)
  const [answeredIndexes, setAnsweredIndexes] = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement | null>(null)

  const finished = order.length > 0 && answeredIndexes.size === order.length

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  if (items.length === 0) {
    return <p className="text-muted">Bài học này chưa có từ vựng.</p>
  }

  const current = order[index]

  function goTo(i: number) {
    setIndex(i)
    setInput('')
    setRevealAnswer(false)
  }

  function handleSubmit() {
    if (answeredIndexes.has(index) || !input.trim()) return
    if (isCorrectAnswer(input, current.germanWord)) {
      setAnsweredIndexes((prev) => new Set(prev).add(index))
      if (index < order.length - 1) {
        goTo(index + 1)
      } else {
        setInput('')
        setRevealAnswer(false)
      }
    } else {
      setRevealAnswer(true)
      setInput('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  function insertChar(char: string) {
    const el = inputRef.current
    const start = el?.selectionStart ?? input.length
    const end = el?.selectionEnd ?? input.length
    const next = input.slice(0, start) + char + input.slice(end)
    setInput(next)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + char.length, start + char.length)
    })
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

      <div className="mb-6 rounded-md border border-hairline bg-white p-6 text-center">
        {questionDisplay(current) && (
          <QuestionSentence display={questionDisplay(current)!} className="text-lg font-medium text-ink" />
        )}
        <p className="mt-4 text-sm text-muted">
          Hint: {current.englishMeaning ? `${current.englishMeaning} ` : ''}
          {current.englishMeaning ? `(${current.vietnameseMeaning})` : current.vietnameseMeaning}
        </p>
      </div>

      {!answeredIndexes.has(index) && (
        <>
          <Field
            ref={inputRef}
            id="type-word-answer"
            label="Gõ từ tiếng Đức, rồi nhấn Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoFocus
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-muted">Không gõ được dấu?</span>
            {UMLAUT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => insertChar(key)}
                className="rounded-sm border border-hairline px-2.5 py-1 text-sm font-medium text-ink hover:bg-surface"
              >
                {key}
              </button>
            ))}
          </div>
        </>
      )}

      {revealAnswer && !answeredIndexes.has(index) && (
        <p className="mt-3 text-sm font-medium text-danger">
          Chưa đúng — đáp án là "{current.germanWord}". Gõ lại cho đúng để qua câu mới.
        </p>
      )}

      {answeredIndexes.has(index) && (
        <p className="text-sm font-medium text-success">Đã hoàn thành: "{current.germanWord}"</p>
      )}

      <p className="mb-2 mt-6 font-medium text-ink">Danh sách bài tập:</p>
      <div className="flex flex-wrap gap-2">
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
    </div>
  )
}
