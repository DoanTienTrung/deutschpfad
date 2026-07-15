import { useEffect, useMemo, useState } from 'react'
import type { VocabularyItem } from '../../api/types'
import { buildChoices, questionText, shuffle } from '../../lib/quiz'

export default function MultipleChoiceExercise({
  items,
  onComplete,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
}) {
  const [order] = useState(() => shuffle(items))
  const [index, setIndex] = useState(0)
  const [selectedByIndex, setSelectedByIndex] = useState<Record<number, string>>({})
  const [autoAdvance, setAutoAdvance] = useState(true)

  const answeredCount = Object.keys(selectedByIndex).length
  const score = order.filter((item, i) => selectedByIndex[i] === item.germanWord).length
  const finished = order.length > 0 && answeredCount === order.length

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  const choices = useMemo(() => {
    if (order.length === 0) return []
    return buildChoices(
      order[index].germanWord,
      order.map((item) => item.germanWord)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-shuffle choices only when moving to a different question
  }, [index])

  if (items.length < 4) {
    return <p className="text-muted">Cần ít nhất 4 từ trong bài học để luyện dạng này.</p>
  }

  const current = order[index]
  const selected = selectedByIndex[index] ?? null

  function handleSelect(choice: string) {
    if (selectedByIndex[index]) return
    setSelectedByIndex((prev) => ({ ...prev, [index]: choice }))
    if (autoAdvance && index < order.length - 1) {
      setTimeout(() => setIndex((i) => Math.min(i + 1, order.length - 1)), 900)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-sm border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
        >
          ← Câu trước
        </button>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Tự động chuyển câu
        </label>

        <button
          onClick={() => setIndex((i) => Math.min(order.length - 1, i + 1))}
          disabled={index === order.length - 1}
          className="rounded-sm border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
        >
          Câu sau →
        </button>
      </div>

      <p className="mb-2 font-medium text-ink">Danh sách bài tập:</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {order.map((_, i) => {
          const answer = selectedByIndex[i]
          const isCurrent = i === index
          const stateClass = isCurrent
            ? 'bg-primary text-canvas'
            : answer === undefined
              ? 'border border-hairline text-ink hover:bg-surface'
              : answer === order[i].germanWord
                ? 'border border-success bg-success-bg text-success'
                : 'border border-danger bg-danger-bg text-danger'
          return (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-9 w-9 rounded-sm text-sm font-medium ${stateClass}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {finished && (
        <p className="mb-4 text-center font-display text-lg font-semibold text-ink">
          Hoàn thành! Đúng {score}/{order.length} câu.
        </p>
      )}

      <div className="mb-6 rounded-md border border-hairline bg-white p-6 text-center">
        {questionText(current) && (
          <p className="text-lg font-medium text-ink">{questionText(current)}</p>
        )}
        <p className="mt-4 text-sm text-muted">
          Hint: {current.englishMeaning ? `${current.englishMeaning} ` : ''}
          {current.englishMeaning ? `(${current.vietnameseMeaning})` : current.vietnameseMeaning}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {choices.map((choice) => {
          const isCorrect = choice === current.germanWord
          const showResult = selected !== null
          const stateClass = !showResult
            ? 'border-hairline hover:bg-surface'
            : isCorrect
              ? 'border-success bg-success-bg text-success'
              : choice === selected
                ? 'border-danger bg-danger-bg text-danger'
                : 'border-hairline opacity-50'
          return (
            <button
              key={choice}
              onClick={() => handleSelect(choice)}
              disabled={selected !== null}
              className={`rounded-sm border px-4 py-3 text-center font-medium ${stateClass}`}
            >
              {choice}
            </button>
          )
        })}
      </div>
    </div>
  )
}
