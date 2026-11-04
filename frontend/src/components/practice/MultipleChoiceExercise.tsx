import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnswerOption, Button, Card, Checkbox, QuestionNav, type AnswerState } from '@kit'
import type { VocabularyItem } from '../../api/types'
import type { PracticeResultHandler } from '../../lib/practiceResult'
import { buildChoices, questionDisplay, shuffle } from '../../lib/quiz'
import QuestionSentence from './QuestionSentence'

export default function MultipleChoiceExercise({
  items,
  onComplete,
  onResult,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
  /** Lần chọn của mỗi câu — chỉ được chọn một lần, nên đó cũng là lần thử đầu. */
  onResult?: PracticeResultHandler
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
    return <p className="text-radiert">Cần ít nhất 4 từ trong bài học để luyện dạng này.</p>
  }

  const current = order[index]
  const selected = selectedByIndex[index] ?? null

  function handleSelect(choice: string) {
    if (selectedByIndex[index]) return
    setSelectedByIndex((prev) => ({ ...prev, [index]: choice }))
    onResult?.(current, choice === current.germanWord)
    if (autoAdvance && index < order.length - 1) {
      setTimeout(() => setIndex((i) => Math.min(i + 1, order.length - 1)), 900)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button variant="secondary" size="sm" icon={<ArrowLeft className="size-4" aria-hidden="true" />}
          onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Câu trước
        </Button>

        <Checkbox label="Tự động chuyển câu" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />

        <Button variant="secondary" size="sm" onClick={() => setIndex((i) => Math.min(order.length - 1, i + 1))}
          disabled={index === order.length - 1}>
          Câu sau
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {finished && (
        <p className="mb-4 text-center font-display text-lg font-semibold text-bleistift">
          Hoàn thành! Đúng {score}/{order.length} câu.
        </p>
      )}

      <Card className="mb-6 p-6 text-center">
        {questionDisplay(current) && (
          <QuestionSentence display={questionDisplay(current)!} className="text-lg font-medium text-bleistift" />
        )}
        <p className="mt-4 text-sm text-radiert">
          Hint: {current.englishMeaning ? `${current.englishMeaning} ` : ''}
          {current.englishMeaning ? `(${current.vietnameseMeaning})` : current.vietnameseMeaning}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const isCorrect = choice === current.germanWord
          const state: AnswerState = selected === null ? 'idle' : isCorrect ? 'correct' : choice === selected ? 'wrong' : 'dim'
          return (
            <AnswerOption key={choice} state={state} onClick={() => handleSelect(choice)} disabled={selected !== null}>
              {choice}
            </AnswerOption>
          )
        })}
      </div>

      <p className="mt-6 mb-2 font-medium text-bleistift">Danh sách bài tập:</p>
      <QuestionNav current={index} onSelect={setIndex}
        marks={order.map((item, i) => selectedByIndex[i] === undefined ? 'open' : selectedByIndex[i] === item.germanWord ? 'correct' : 'wrong')} />
    </div>
  )
}
