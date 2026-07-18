import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDueCards } from '../api/vocabularyApi'
import type { VocabularyItem } from '../api/types'
import LessonFlashcardExercise from '../components/practice/LessonFlashcardExercise'

export default function ReviewPage() {
  const [items, setItems] = useState<VocabularyItem[] | null>(null)

  useEffect(() => {
    getDueCards()
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-4 text-sm text-muted">
        <Link to="/app" className="text-primary hover:underline">
          Trang chủ
        </Link>
        {' / '}
        Ôn tập
      </nav>

      {items === null && <p className="text-muted">Đang tải...</p>}

      {items !== null && items.length === 0 && (
        <div className="rounded-lg bg-surface p-8 text-center shadow-lifted">
          <p className="font-display text-lg font-semibold text-ink">🎉 Không có từ nào cần ôn tập lúc này!</p>
          <p className="mt-2 text-sm text-muted">Quay lại sau hoặc học thêm từ mới nhé.</p>
          <Link
            to="/app/vocabulary"
            className="mt-6 inline-block rounded-sm bg-primary px-6 py-3 text-center font-medium text-canvas"
          >
            Học từ vựng
          </Link>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <LessonFlashcardExercise key={`review-${items.length}`} items={items} />
      )}
    </div>
  )
}
