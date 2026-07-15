import { useEffect, useState } from 'react'
import {
  listVocabularyItems,
  createVocabularyItem,
  updateVocabularyItem,
  deleteVocabularyItem,
  listTopics,
  listLessons,
  type VocabularyItemInput,
} from '../../api/adminApi'
import type { VocabularyItem, Topic, Lesson, VocabularySource } from '../../api/types'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const EMPTY_FORM: VocabularyItemInput = {
  germanWord: '',
  vietnameseMeaning: '',
  englishMeaning: '',
  phonetic: '',
  wordType: '',
  exampleSentence: '',
  imageUrl: '',
  level: 'A1',
  source: 'FREQUENCY',
  topicId: null,
  lessonId: null,
}

export default function AdminVocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [form, setForm] = useState<VocabularyItemInput>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const [i, t, l] = await Promise.all([listVocabularyItems(), listTopics(), listLessons()])
    setItems(i)
    setTopics(t)
    setLessons(l)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  function startEdit(item: VocabularyItem) {
    setEditingId(item.id)
    setForm({
      germanWord: item.germanWord,
      vietnameseMeaning: item.vietnameseMeaning,
      englishMeaning: item.englishMeaning ?? '',
      phonetic: item.phonetic ?? '',
      wordType: item.wordType ?? '',
      exampleSentence: item.exampleSentence ?? '',
      imageUrl: item.imageUrl ?? '',
      level: item.level,
      source: item.source,
      topicId: item.topicId,
      lessonId: item.lessonId,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit() {
    setError(null)
    try {
      if (editingId) {
        await updateVocabularyItem(editingId, form)
      } else {
        await createVocabularyItem(form)
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteVocabularyItem(id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Từ vựng</h2>

      {error && <div className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="mb-6 space-y-2 rounded-sm border border-hairline bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
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
            value={form.englishMeaning}
            onChange={(e) => setForm({ ...form, englishMeaning: e.target.value })}
            placeholder="Nghĩa tiếng Anh (tuỳ chọn)"
            className="rounded-sm border border-hairline px-3 py-2"
          />
          <input
            value={form.phonetic}
            onChange={(e) => setForm({ ...form, phonetic: e.target.value })}
            placeholder="Phiên âm IPA (tuỳ chọn)"
            className="rounded-sm border border-hairline px-3 py-2"
          />
          <input
            value={form.wordType}
            onChange={(e) => setForm({ ...form, wordType: e.target.value })}
            placeholder="Loại từ (vd. Nomen, Verb)"
            className="rounded-sm border border-hairline px-3 py-2"
          />
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="rounded-sm border border-hairline px-3 py-2"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value as VocabularySource })}
            className="rounded-sm border border-hairline px-3 py-2"
          >
            <option value="FREQUENCY">Nguồn: Tần suất</option>
            <option value="GOETHE">Nguồn: Goethe-Zertifikat</option>
          </select>
          <select
            value={form.topicId ?? ''}
            onChange={(e) => setForm({ ...form, topicId: e.target.value ? Number(e.target.value) : null })}
            className="rounded-sm border border-hairline px-3 py-2"
          >
            <option value="">-- Không chọn chủ đề --</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            value={form.lessonId ?? ''}
            onChange={(e) => setForm({ ...form, lessonId: e.target.value ? Number(e.target.value) : null })}
            className="rounded-sm border border-hairline px-3 py-2"
          >
            <option value="">-- Không chọn bài học --</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>{l.level} - Bài {l.orderIndex}: {l.title}</option>
            ))}
          </select>
        </div>
        <textarea
          value={form.exampleSentence}
          onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
          placeholder="Câu ví dụ"
          className="w-full rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="URL ảnh minh hoạ (tuỳ chọn)"
          className="w-full rounded-sm border border-hairline px-3 py-2"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="rounded-sm bg-primary px-4 py-2 font-medium text-white"
          >
            {editingId ? 'Cập nhật' : 'Thêm từ vựng'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="rounded-sm border border-hairline px-4 py-2">
              Huỷ
            </button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <div>
              <strong>{item.germanWord}</strong>
              {item.phonetic && <span className="text-muted"> [{item.phonetic}]</span>}
              {' — '}{item.vietnameseMeaning}
              {item.englishMeaning && <span className="text-muted"> ({item.englishMeaning})</span>}
              <span className="ml-2 text-xs text-muted">
                [{item.level}{item.topicName ? ` · ${item.topicName}` : ''}{item.lessonTitle ? ` · ${item.lessonTitle}` : ''}]
              </span>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => startEdit(item)} className="text-primary hover:underline">
                Sửa
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">
                Xoá
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
