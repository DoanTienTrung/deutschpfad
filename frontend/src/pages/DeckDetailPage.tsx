import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listDeckItems, addDeckItem, deleteDeckItem, lookupVocabWord, type DeckItemInput } from '../api/deckApi'
import type { DeckItem } from '../api/types'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import Field from '../components/ui/Field'

const EMPTY_FORM: DeckItemInput = {
  germanWord: '',
  vietnameseMeaning: '',
  wordType: '',
  exampleSentence: '',
  phonetic: '',
  englishMeaning: '',
  synonyms: '',
  antonyms: '',
}

export default function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const id = Number(deckId)

  const [items, setItems] = useState<DeckItem[]>([])
  const [form, setForm] = useState<DeckItemInput>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  useEffect(() => {
    listDeckItems(id)
      .then(setItems)
      .catch(() => setError('Không tải được danh sách từ'))
  }, [id])

  async function handleLookup() {
    if (!form.germanWord.trim()) return
    setLookupError(null)
    setLookupLoading(true)
    try {
      const result = await lookupVocabWord(form.germanWord.trim())
      setForm({
        germanWord: result.germanWord,
        vietnameseMeaning: result.vietnameseMeaning,
        wordType: result.wordType,
        exampleSentence: result.exampleSentence,
        phonetic: result.phonetic,
        englishMeaning: result.englishMeaning ?? '',
        synonyms: result.synonyms ?? '',
        antonyms: result.antonyms ?? '',
      })
    } catch {
      setLookupError('Không tự động điền được, bạn nhập tay giúp mình nhé')
    } finally {
      setLookupLoading(false)
    }
  }

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
      <h2 className="mb-4 font-display text-2xl font-bold text-ink">Chi tiết bộ từ</h2>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="mb-8 space-y-3 rounded-lg border border-hairline bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Field
              id="deck-item-german-word"
              label="Từ tiếng Đức"
              value={form.germanWord}
              onChange={(e) => setForm({ ...form, germanWord: e.target.value })}
              placeholder="Nhập hoặc dán từ tiếng Đức"
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={lookupLoading || !form.germanWord.trim()}
            className="shrink-0 self-start rounded-md border border-primary px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-40 sm:self-auto"
          >
            {lookupLoading ? 'Đang điền...' : '✨ Tự động điền AI'}
          </button>
        </div>

        {lookupError && <p className="text-sm text-danger">{lookupError}</p>}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field
            id="deck-item-vi-meaning"
            label="Nghĩa tiếng Việt"
            value={form.vietnameseMeaning}
            onChange={(e) => setForm({ ...form, vietnameseMeaning: e.target.value })}
          />
          <Field
            id="deck-item-en-meaning"
            label="Nghĩa tiếng Anh (tuỳ chọn)"
            value={form.englishMeaning}
            onChange={(e) => setForm({ ...form, englishMeaning: e.target.value })}
          />
          <Field
            id="deck-item-word-type"
            label="Loại từ (tuỳ chọn)"
            value={form.wordType}
            onChange={(e) => setForm({ ...form, wordType: e.target.value })}
          />
          <Field
            id="deck-item-phonetic"
            label="Phiên âm IPA (tuỳ chọn)"
            value={form.phonetic}
            onChange={(e) => setForm({ ...form, phonetic: e.target.value })}
          />
          {/* sm: prefix matters -- a bare col-span-2 inside the phone's 1-column grid forces an
              implicit second column and breaks the whole form layout on mobile. */}
          <div className="sm:col-span-2">
            <Field
              id="deck-item-example"
              label="Câu ví dụ (tuỳ chọn)"
              value={form.exampleSentence}
              onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
            />
          </div>
          <Field
            id="deck-item-synonyms"
            label="Từ đồng nghĩa (tuỳ chọn)"
            value={form.synonyms}
            onChange={(e) => setForm({ ...form, synonyms: e.target.value })}
          />
          <Field
            id="deck-item-antonyms"
            label="Từ trái nghĩa (tuỳ chọn)"
            value={form.antonyms}
            onChange={(e) => setForm({ ...form, antonyms: e.target.value })}
          />
        </div>

        <Button onClick={handleAdd}>Thêm từ</Button>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-hairline bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <strong className="font-display">{item.germanWord}</strong>
                {item.phonetic && <span className="ml-1 text-sm text-muted">/{item.phonetic}/</span>}
                {' — '}
                {item.vietnameseMeaning}
                {item.englishMeaning && <span className="text-muted"> ({item.englishMeaning})</span>}
              </span>
              <button onClick={() => handleDelete(item.id)} className="shrink-0 text-sm text-danger hover:underline">
                Xoá
              </button>
            </div>
            {item.exampleSentence && <p className="mt-1 text-sm italic text-muted">{item.exampleSentence}</p>}
            {(item.synonyms || item.antonyms) && (
              <p className="mt-1 text-xs text-muted">
                {item.synonyms && <>Đồng nghĩa: {item.synonyms}</>}
                {item.synonyms && item.antonyms && ' · '}
                {item.antonyms && <>Trái nghĩa: {item.antonyms}</>}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
