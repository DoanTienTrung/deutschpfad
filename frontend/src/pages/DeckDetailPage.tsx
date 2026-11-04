import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button, Card, ConfirmDialog, Field, Input, NativeSelect, Note, PageHeader } from '@kit'
import { listDeckItems, addDeckItem, updateDeckItem, deleteDeckItem, lookupVocabWord, type DeckItemInput } from '../api/deckApi'
import type { DeckItem } from '../api/types'

// Same list the backend AI prompt uses (GroqAiService.buildVocabLookupPrompt) -- picking one here
// before hitting "Tự động điền AI" pins the word type so the AI can't mis-guess it (eg. turning
// an adjective into a nominalized noun with a der/die/das it shouldn't have).
const WORD_TYPES = [
  'Nomen', 'Verb', 'Adjektiv', 'Adverb', 'Präposition', 'Konjunktion', 'Pronomen', 'Zahl', 'Interjektion',
]

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
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
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
      const result = await lookupVocabWord(form.germanWord.trim(), form.wordType)
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

  async function handleSubmit() {
    setError(null)
    try {
      if (editingItemId !== null) {
        const updated = await updateDeckItem(id, editingItemId, form)
        setItems((prev) => prev.map((i) => (i.id === editingItemId ? updated : i)))
        setEditingItemId(null)
      } else {
        const item = await addDeckItem(id, form)
        setItems((prev) => [...prev, item])
      }
      setForm(EMPTY_FORM)
    } catch {
      setError(editingItemId !== null ? 'Không sửa được từ' : 'Không thêm được từ')
    }
  }

  function startEditItem(item: DeckItem) {
    setEditingItemId(item.id)
    setForm({
      germanWord: item.germanWord,
      vietnameseMeaning: item.vietnameseMeaning,
      wordType: item.wordType ?? '',
      exampleSentence: item.exampleSentence ?? '',
      phonetic: item.phonetic ?? '',
      englishMeaning: item.englishMeaning ?? '',
      synonyms: item.synonyms ?? '',
      antonyms: item.antonyms ?? '',
    })
    // The shared form sits at the top of the page -- bring it into view so the user sees
    // the fields they're about to edit instead of wondering whether the button did anything.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditItem() {
    setEditingItemId(null)
    setForm(EMPTY_FORM)
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
    <div className="mx-auto max-w-lesen">
      <PageHeader title="Chi tiết bộ từ" back={{ to: '/app/decks', label: 'Danh sách bộ từ' }} />

      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      <Card title={editingItemId !== null ? 'Sửa từ' : 'Thêm từ mới'} className="mb-8">
        <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Field label="Từ tiếng Đức">
              <Input value={form.germanWord} onChange={(e) => setForm({ ...form, germanWord: e.target.value })} placeholder="Nhập hoặc dán từ tiếng Đức" />
            </Field>
          </div>
          <Field label="Loại từ" className="sm:w-40">
            <NativeSelect value={form.wordType} onChange={(e) => setForm({ ...form, wordType: e.target.value })}>
              <option value="">Để AI tự đoán</option>
              {WORD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </NativeSelect>
          </Field>
          <Button variant="secondary" onClick={handleLookup} disabled={!form.germanWord.trim()} loading={lookupLoading}
            icon={<Sparkles className="size-4" aria-hidden="true" />} className="shrink-0 self-start sm:self-auto">
            {lookupLoading ? 'Đang điền...' : 'Tự động điền AI'}
          </Button>
        </div>
        <p className="text-xs text-radiert">
          Chọn loại từ trước khi bấm "Tự động điền AI" để AI không đoán nhầm (vd. tính từ bị biến thành danh từ).
        </p>

        {lookupError && <Note tone="bad">{lookupError}</Note>}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Nghĩa tiếng Việt">
            <Input value={form.vietnameseMeaning} onChange={(e) => setForm({ ...form, vietnameseMeaning: e.target.value })} />
          </Field>
          <Field label="Nghĩa tiếng Anh (tuỳ chọn)">
            <Input value={form.englishMeaning} onChange={(e) => setForm({ ...form, englishMeaning: e.target.value })} />
          </Field>
          <Field label="Phiên âm IPA (tuỳ chọn)">
            <Input value={form.phonetic} onChange={(e) => setForm({ ...form, phonetic: e.target.value })} />
          </Field>
          {/* sm: prefix matters -- a bare col-span-2 inside the phone's 1-column grid forces an
              implicit second column and breaks the whole form layout on mobile. */}
          <div className="sm:col-span-2">
            <Field label="Câu ví dụ (tuỳ chọn)">
              <Input value={form.exampleSentence} onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })} />
            </Field>
          </div>
          <Field label="Từ đồng nghĩa (tuỳ chọn)">
            <Input value={form.synonyms} onChange={(e) => setForm({ ...form, synonyms: e.target.value })} />
          </Field>
          <Field label="Từ trái nghĩa (tuỳ chọn)">
            <Input value={form.antonyms} onChange={(e) => setForm({ ...form, antonyms: e.target.value })} />
          </Field>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit}>{editingItemId !== null ? 'Lưu thay đổi' : 'Thêm từ'}</Button>
          {editingItemId !== null && (
            <Button variant="secondary" onClick={cancelEditItem}>
              Huỷ
            </Button>
          )}
        </div>
        </div>
      </Card>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <strong className="font-display">{item.germanWord}</strong>
                {item.phonetic && <span className="ml-1 text-sm text-radiert">/{item.phonetic}/</span>}
                {' - '}
                {item.vietnameseMeaning}
                {item.englishMeaning && <span className="text-radiert"> ({item.englishMeaning})</span>}
              </span>
              <span className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEditItem(item)}>Sửa</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(item.id)} className="text-rotstift">Xoá</Button>
              </span>
            </div>
            {item.exampleSentence && <p className="mt-1 text-sm italic text-radiert">{item.exampleSentence}</p>}
            {(item.synonyms || item.antonyms) && (
              <p className="mt-1 text-xs text-radiert">
                {item.synonyms && <>Đồng nghĩa: {item.synonyms}</>}
                {item.synonyms && item.antonyms && ' · '}
                {item.antonyms && <>Trái nghĩa: {item.antonyms}</>}
              </p>
            )}
            </Card>
          </li>
        ))}
      </ul>

      <ConfirmDialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} danger confirmLabel="Xoá từ"
        title="Xoá từ này khỏi bộ?" description="Không hoàn tác được."
        onConfirm={() => { if (confirmDeleteId !== null) handleDelete(confirmDeleteId); setConfirmDeleteId(null) }} />
    </div>
  )
}
