import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listDeckItems } from '../api/deckApi'
import type { DeckItem } from '../api/types'
import DeckFlashcardExercise from '../components/practice/DeckFlashcardExercise'

export default function DeckPracticePage() {
  const { deckId } = useParams<{ deckId: string }>()
  const id = Number(deckId)

  const [items, setItems] = useState<DeckItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDeckItems(id)
      .then(setItems)
      .catch(() => setError('Không tải được danh sách từ'))
  }, [id])

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/app/decks" className="mb-4 inline-block text-sm text-primary hover:underline">
        ← Quay lại danh sách bộ từ
      </Link>

      {error && <p className="text-danger">{error}</p>}
      {!error && items === null && <p className="text-muted">Đang tải...</p>}
      {items !== null && <DeckFlashcardExercise key={`deck-practice-${id}`} items={items} />}
    </div>
  )
}
