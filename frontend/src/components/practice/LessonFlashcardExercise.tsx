import { useEffect, useState } from 'react'
import { submitReview } from '../../api/vocabularyApi'
import type { VocabularyItem, ReviewQuality } from '../../api/types'
import { shuffle } from '../../lib/quiz'
import { speak } from '../../lib/speech'
import Button from '../ui/Button'
import Alert from '../ui/Alert'

export default function LessonFlashcardExercise({
  items,
  onComplete,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
}) {
  const [order] = useState(() => shuffle(items))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewedCount, setReviewedCount] = useState(0)

  const finished = index >= order.length

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  if (finished) {
    return (
      <p className="text-center font-display text-lg font-semibold text-ink">
        Hoàn thành! Đã ôn {reviewedCount} thẻ.
      </p>
    )
  }

  const card = order[index]

  async function handleAnswer(quality: ReviewQuality) {
    setError(null)
    try {
      await submitReview(card.id, quality)
      setReviewedCount((c) => c + 1)
      setFlipped(false)
      setIndex((i) => i + 1)
    } catch {
      setError('Không gửi được kết quả ôn tập')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {error && <Alert tone="danger">{error}</Alert>}

      <p className="mb-4 text-center text-sm text-muted">
        Thẻ {index + 1}/{order.length}
      </p>

      <div
        onClick={() => setFlipped((f) => !f)}
        className="cursor-pointer rounded-lg bg-surface p-8 text-center shadow-lifted"
      >
        {!flipped ? (
          <>
            <p className="font-display text-3xl font-semibold text-ink">{card.germanWord}</p>
            {card.phonetic && <p className="mt-1 text-base text-muted">[{card.phonetic}]</p>}
            <p className="mt-2 text-sm text-muted">[{card.level}]</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                speak(card.germanWord)
              }}
              className="mt-4 text-2xl"
              aria-label="Phát âm"
            >
              🔊
            </button>
            <p className="mt-6 text-xs text-muted">Bấm để xem nghĩa</p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold text-ink">{card.vietnameseMeaning}</p>
            {card.englishMeaning && <p className="mt-1 text-sm text-muted">{card.englishMeaning}</p>}
            {card.exampleSentence && (
              <p className="mt-4 text-sm italic text-muted">{card.exampleSentence}</p>
            )}
          </>
        )}
      </div>

      {flipped && (
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Button variant="secondary" onClick={() => handleAnswer('FORGOT')} className="text-danger">
            Quên
          </Button>
          <Button variant="secondary" onClick={() => handleAnswer('REMEMBERED')}>
            Nhớ
          </Button>
          <Button variant="primary" onClick={() => handleAnswer('EASY')}>
            Dễ
          </Button>
        </div>
      )}
    </div>
  )
}
