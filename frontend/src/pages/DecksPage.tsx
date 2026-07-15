import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDecks, createDeck, deleteDeck } from '../api/deckApi'
import type { Deck } from '../api/types'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDecks()
      .then(setDecks)
      .catch(() => setError('Không tải được danh sách bộ từ'))
  }, [])

  async function handleCreate() {
    setError(null)
    try {
      const deck = await createDeck(name, description)
      setDecks((prev) => [...prev, deck])
      setName('')
      setDescription('')
    } catch {
      setError('Không tạo được bộ từ')
    }
  }

  async function handleDelete(deckId: number) {
    setError(null)
    try {
      await deleteDeck(deckId)
      setDecks((prev) => prev.filter((d) => d.id !== deckId))
    } catch {
      setError('Không xoá được bộ từ')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Bộ từ của tôi</h2>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="mb-6 space-y-2 rounded-sm border border-hairline bg-white p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên bộ từ (vd. Từ vựng phỏng vấn)"
          className="w-full rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả (tuỳ chọn)"
          className="w-full rounded-sm border border-hairline px-3 py-2"
        />
        <Button onClick={handleCreate}>Tạo bộ từ</Button>
      </div>

      <ul className="space-y-2">
        {decks.map((deck) => (
          <li
            key={deck.id}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <Link to={`/app/decks/${deck.id}`} className="text-primary hover:underline">
              {deck.name} <span className="text-sm text-muted">({deck.itemCount} từ)</span>
            </Link>
            <button onClick={() => handleDelete(deck.id)} className="text-sm text-red-600 hover:underline">
              Xoá
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
