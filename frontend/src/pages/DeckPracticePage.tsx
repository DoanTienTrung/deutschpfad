import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Note, PageHeader, Skeleton } from '@kit'
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
    <div className="mx-auto max-w-lesen">
      <PageHeader title="Luyện bộ từ" back={{ to: '/app/decks', label: 'Danh sách bộ từ' }} />

      {error && <Note tone="bad">{error}</Note>}
      {!error && items === null && <Skeleton className="mx-auto h-64 max-w-xl" />}
      {items !== null && <DeckFlashcardExercise key={`deck-practice-${id}`} items={items} />}
    </div>
  )
}
