import { useEffect, useState, type CSSProperties } from 'react'
import { Check, Pencil, Play, Plus, Trash2, X } from 'lucide-react'
import { Badge, Button, ButtonLink, Card, ConfirmDialog, EmptyState, Field, IconButton, Input, Note, PageHeader } from '@kit'
import { listDecks, createDeck, deleteDeck, updateDeck } from '../api/deckApi'
import type { Deck } from '../api/types'

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Deck | null>(null)

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
    <div className="mx-auto max-w-lesen">
      <PageHeader title="Bộ từ của tôi" description="Tự tạo bộ từ riêng cho từng tình huống: phỏng vấn, nhập học, khám bệnh, làm giấy tờ..." />

      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      <Card title="Tạo bộ từ mới" className="mb-8">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (name.trim()) handleCreate() }}>
          <Field label="Tên bộ từ">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="vd. Từ vựng phỏng vấn" />
          </Field>
          <Field label="Mô tả (tuỳ chọn)">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Button type="submit" disabled={!name.trim()} icon={<Plus className="size-4" aria-hidden="true" />}>Tạo bộ từ</Button>
        </form>
      </Card>

      {decks.length === 0 && !error && (
        <EmptyState title="Chưa có bộ từ nào" description="Tạo bộ từ đầu tiên ở trên, rồi thêm từ bạn muốn ôn." />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {decks.map((deck, i) => (
          <Card key={deck.id} style={{ '--stagger-index': i % 12 } as CSSProperties} className="stagger-in p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {editingId === deck.id ? (
                  <form className="flex flex-1 items-center gap-1" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(deck) }}>
                    <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus aria-label="Tên bộ từ" className="min-h-10" />
                    <IconButton type="submit" label="Lưu tên" icon={<Check className="size-4" aria-hidden="true" />} />
                    <IconButton label="Huỷ" icon={<X className="size-4" aria-hidden="true" />} onClick={() => setEditingId(null)} />
                  </form>
                ) : (
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 font-display font-semibold text-bleistift">
                      <span className="truncate">{deck.name}</span>
                      <IconButton label="Sửa tên bộ từ" icon={<Pencil className="size-3.5" aria-hidden="true" />} onClick={() => startEdit(deck)} className="size-9" />
                    </p>
                    <Badge>{deck.itemCount} từ</Badge>
                  </div>
                )}
              </div>
              <IconButton label={`Xoá bộ từ ${deck.name}`} icon={<Trash2 className="size-4" aria-hidden="true" />}
                onClick={() => setConfirmDelete(deck)} className="text-rotstift" />
            </div>

            <div className="flex gap-2">
              <ButtonLink to={`/app/decks/${deck.id}`} variant="secondary" size="sm" className="flex-1" icon={<Plus className="size-4" aria-hidden="true" />}>
                Thêm từ
              </ButtonLink>
              {deck.itemCount === 0 ? (
                <Button size="sm" disabled className="flex-1" icon={<Play className="size-4" aria-hidden="true" />}>Luyện tập</Button>
              ) : (
                <ButtonLink to={`/app/decks/${deck.id}/practice`} size="sm" className="flex-1" icon={<Play className="size-4" aria-hidden="true" />}>
                  Luyện tập
                </ButtonLink>
              )}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} danger confirmLabel="Xoá bộ từ"
        title={`Xoá bộ từ "${confirmDelete?.name ?? ''}"?`} description="Các từ trong bộ cũng bị xoá theo. Không hoàn tác được."
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete.id); setConfirmDelete(null) }} />
    </div>
  )
}
