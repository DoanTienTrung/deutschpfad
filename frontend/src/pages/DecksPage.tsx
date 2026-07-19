import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDecks, createDeck, deleteDeck, updateDeck } from '../api/deckApi'
import type { Deck } from '../api/types'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')

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

  function startEdit(deck: Deck) {
    setEditingId(deck.id)
    setEditingName(deck.name)
  }

  async function handleSaveEdit(deck: Deck) {
    if (!editingName.trim()) return
    setError(null)
    try {
      const updated = await updateDeck(deck.id, editingName.trim(), deck.description ?? '')
      setDecks((prev) => prev.map((d) => (d.id === deck.id ? updated : d)))
      setEditingId(null)
    } catch {
      setError('Không đổi được tên bộ từ')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-bold text-ink">Bộ từ của tôi</h2>
      <p className="mt-1 mb-6 text-sm text-muted">
        Tự tạo bộ từ riêng cho từng tình huống: phỏng vấn, nhập học, khám bệnh, làm giấy tờ...
      </p>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="mb-8 rounded-lg border border-hairline bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Tạo bộ từ mới</p>
        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên bộ từ (vd. Từ vựng phỏng vấn)"
            className="w-full rounded-sm border border-hairline px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả (tuỳ chọn)"
            className="w-full rounded-sm border border-hairline px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button onClick={handleCreate}>Tạo bộ từ</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {decks.map((deck, i) => (
            <div
              key={deck.id}
              style={{ '--stagger-index': i % 12 } as React.CSSProperties}
              className="stagger-in rounded-lg border border-hairline bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex flex-1 items-center gap-3">
                  {editingId === deck.id ? (
                    <div className="flex flex-1 items-center gap-1">
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(deck)}
                        autoFocus
                        className="flex-1 rounded-sm border border-hairline px-2 py-1 text-sm"
                      />
                      <button onClick={() => handleSaveEdit(deck)} aria-label="Lưu tên" className="text-primary">
                        ✓
                      </button>
                      <button onClick={() => setEditingId(null)} aria-label="Huỷ" className="text-muted">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-display font-semibold text-ink">
                        {deck.name}
                        <button
                          onClick={() => startEdit(deck)}
                          aria-label="Sửa tên bộ từ"
                          className="ml-1.5 text-sm text-muted hover:text-primary"
                        >
                          ✎
                        </button>
                      </p>
                      <span className="inline-block rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                        {deck.itemCount} từ
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(deck.id)} className="shrink-0 text-sm text-danger hover:underline">
                  Xoá
                </button>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/app/decks/${deck.id}`}
                  className="flex-1 rounded-sm border border-hairline px-3 py-2 text-center text-sm font-medium text-ink hover:bg-surface"
                >
                  + Thêm từ
                </Link>
                <Link
                  to={`/app/decks/${deck.id}/practice`}
                  className={`flex-1 rounded-sm px-3 py-2 text-center text-sm font-medium ${
                    deck.itemCount === 0
                      ? 'pointer-events-none bg-hairline text-muted'
                      : 'bg-primary text-canvas hover:bg-primary-deep'
                  }`}
                  aria-disabled={deck.itemCount === 0}
                >
                  ▶ Luyện tập
                </Link>
              </div>
            </div>
        ))}
      </div>
    </div>
  )
}
