import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listDeckItems, addDeckItem, deleteDeckItem, type DeckItemInput } from '../api/deckApi'
import type { DeckItem } from '../api/types'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

const EMPTY_FORM: DeckItemInput = {
  germanWord: '',
  vietnameseMeaning: '',
  wordType: '',
  exampleSentence: '',
}

export default function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const id = Number(deckId)

  const [items, setItems] = useState<DeckItem[]>([])
  const [form, setForm] = useState<DeckItemInput>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listDeckItems(id)
      .then(setItems)
      .catch(() => setError('Không tải được danh sách từ'))
  }, [id])

  async function handleAdd() {
    setError(null)
    try {
      const item = await addDeckItem(id, form)
      setItems((prev) => [...prev, item])
      setForm(EMPTY_FORM)
    } catch {
      setError('Không thêm được từ')
    }
  }

  async function handleDelete(itemId: number) {
    setError(null)
    try {
      await deleteDeckItem(id, itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch {
      setError('Không xoá được từ')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/app/decks" className="mb-4 inline-block text-sm text-primary hover:underline">
        ← Quay lại danh sách bộ từ
      </Link>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Chi tiết bộ từ</h2>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-sm border border-hairline bg-white p-4">
        <input
          value={form.germanWord}
          onChange={(e) => setForm({ ...form, germanWord: e.target.value })}
          placeholder="Từ tiếng Đức"
          className="rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={form.vietnameseMeaning}
          onChange={(e) => setForm({ ...form, vietnameseMeaning: e.target.value })}
          placeholder="Nghĩa tiếng Việt"
          className="rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={form.wordType}
          onChange={(e) => setForm({ ...form, wordType: e.target.value })}
          placeholder="Loại từ (tuỳ chọn)"
          className="rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={form.exampleSentence}
          onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
          placeholder="Câu ví dụ (tuỳ chọn)"
          className="rounded-sm border border-hairline px-3 py-2"
        />
        <Button onClick={handleAdd} className="col-span-2">
          Thêm từ
        </Button>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <span>
              <strong>{item.germanWord}</strong> — {item.vietnameseMeaning}
            </span>
            <button onClick={() => handleDelete(item.id)} className="text-sm text-red-600 hover:underline">
              Xoá
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
