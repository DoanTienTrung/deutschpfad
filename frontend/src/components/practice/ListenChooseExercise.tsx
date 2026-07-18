import { useEffect, useMemo, useState } from 'react'
import type { VocabularyItem } from '../../api/types'
import { buildChoices, shuffle } from '../../lib/quiz'
import AudioBar from './AudioBar'

export default function ListenChooseExercise({
  items,
  onComplete,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
}) {
  const [order, setOrder] = useState(() => shuffle(items))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [score, setScore] = useState(0)
  const [completedOnePass, setCompletedOnePass] = useState(false)

  useEffect(() => {
    if (completedOnePass) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when the first full pass is done
  }, [completedOnePass])

  const choiceWords = useMemo(() => {
    if (order.length === 0) return []
    return buildChoices(
      order[index].germanWord,
      order.map((item) => item.germanWord),
      Math.min(9, order.length)
    )
  }, [index, order])

  if (items.length < 4) {
    return <p className="text-muted">Cần ít nhất 4 từ trong bài học để luyện dạng này.</p>
  }

  const current = order[index]
  const itemByGermanWord = new Map(order.map((item) => [item.germanWord, item]))

  function goToNext() {
    setSelected(null)
    if (index + 1 >= order.length) {
      setCompletedOnePass(true)
      setOrder(shuffle(items))
      setIndex(0)
    } else {
      setIndex((i) => i + 1)
    }
  }

  function handleSelect(choice: string) {
    if (selected) return
    setSelected(choice)
    setTotalAnswered((n) => n + 1)
    if (choice === current.germanWord) setScore((s) => s + 1)
    setTimeout(goToNext, 900)
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Đã luyện {totalAnswered} từ · Đúng {score}
      </p>

      <div className="mb-6 rounded-md border border-hairline bg-white p-6">
        <AudioBar text={current.germanWord} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {choiceWords.map((word) => {
          const item = itemByGermanWord.get(word) as VocabularyItem
          const isCorrect = word === current.germanWord
          const showResult = selected !== null
          const stateClass = !showResult
            ? 'border-hairline hover:bg-surface'
            : isCorrect
              ? 'border-success bg-success-bg text-success'
              : word === selected
                ? 'border-danger bg-danger-bg text-danger'
                : 'border-hairline opacity-50'
          return (
            <button
              key={word}
              onClick={() => handleSelect(word)}
              disabled={selected !== null}
              className={`rounded-md border p-4 text-center ${stateClass}`}
            >
              <p className="font-display font-semibold">{item.germanWord}</p>
              <p className="mt-1 text-sm">{item.vietnameseMeaning}</p>
              {item.englishMeaning && <p className="text-xs opacity-80">({item.englishMeaning})</p>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
