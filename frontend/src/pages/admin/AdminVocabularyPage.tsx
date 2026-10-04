import { useEffect, useState } from 'react'
import {
  listVocabularyItems,
  createVocabularyItem,
  updateVocabularyItem,
  deleteVocabularyItem,
  listTopics,
  listLessons,
  startExampleTranslation,
  getExampleTranslationStatus,
  type ExampleTranslationStatus,
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
  exampleSentenceVi: '',
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
  const [translation, setTranslation] = useState<ExampleTranslationStatus | null>(null)

  async function load() {
    const [i, t, l] = await Promise.all([listVocabularyItems(), listTopics(), listLessons()])
    setItems(i)
    setTopics(t)
    setLessons(l)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
    getExampleTranslationStatus().then(setTranslation).catch(() => {})
  }, [])

  // Job dịch chạy nền vài chục phút — hỏi tiến độ mỗi 3 giây trong lúc chạy.
  useEffect(() => {
    if (!translation?.running) return
    const timer = setInterval(() => {
      getExampleTranslationStatus().then(setTranslation).catch(() => {})
    }, 3000)
    return () => clearInterval(timer)
  }, [translation?.running])

  async function handleStartTranslation() {
    setError(null)
    try {
      await startExampleTranslation()
      setTranslation(await getExampleTranslationStatus())
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Không bắt đầu được lượt dịch')
    }
  }

  function startEdit(item: VocabularyItem) {
    setEditingId(item.id)
    setForm({
      germanWord: item.germanWord,
      vietnameseMeaning: item.vietnameseMeaning,
      englishMeaning: item.englishMeaning ?? '',
      phonetic: item.phonetic ?? '',
      wordType: item.wordType ?? '',
      exampleSentence: item.exampleSentence ?? '',
      exampleSentenceVi: item.exampleSentenceVi ?? '',
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
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteVocabularyItem(id)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Từ vựng</h2>

      {error && <div className="mb-4 rounded-sm bg-danger-bg p-3 text-sm text-danger">{error}</div>}

      {translation && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-hairline bg-card p-4 text-sm">
          <div>
            <p className="font-medium text-ink">Dịch câu ví dụ sang tiếng Việt (AI)</p>
            {translation.running ? (
              <p className="text-muted">
                Đang dịch {translation.processed}/{translation.total} - dịch mới {translation.translated}, dùng
                lại {translation.reused}
              </p>
            ) : (
              <p className="text-muted">Còn {translation.remaining} câu chưa có bản dịch</p>
            )}
            {!translation.running && translation.stopReason && (
              <p className="mt-1 text-danger">{translation.stopReason}</p>
            )}
          </div>
          <button
            onClick={handleStartTranslation}
            disabled={translation.running || translation.remaining === 0}
            className="rounded-sm bg-primary px-4 py-2 font-medium text-canvas disabled:opacity-40"
          >
            {translation.running ? 'Đang dịch…' : 'Dịch các câu còn thiếu'}
          </button>
        </div>
      )}

      <div className="mb-6 space-y-2 rounded-sm border border-hairline bg-card p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
            <option value="TEXTBOOK">Nguồn: Giáo trình</option>
            <option value="LIFE">Nguồn: Sống ở Đức</option>
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
        <textarea
          value={form.exampleSentenceVi}
          onChange={(e) => setForm({ ...form, exampleSentenceVi: e.target.value })}
          placeholder="Bản dịch câu ví dụ (để trống thì AI dịch khi bấm “Dịch các câu còn thiếu”)"
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
            className="rounded-sm bg-primary px-4 py-2 font-medium text-canvas"
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
            className="flex items-center justify-between rounded-sm border border-hairline bg-card p-3"
          >
            <div>
              <strong>{item.germanWord}</strong>
              {item.phonetic && <span className="text-muted"> [{item.phonetic}]</span>}
              {' - '}{item.vietnameseMeaning}
              {item.englishMeaning && <span className="text-muted"> ({item.englishMeaning})</span>}
              <span className="ml-2 text-xs text-muted">
                [{item.level}{item.topicName ? ` · ${item.topicName}` : ''}{item.lessonTitle ? ` · ${item.lessonTitle}` : ''}]
              </span>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => startEdit(item)} className="text-primary hover:underline">
                Sửa
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-danger hover:underline">
                Xoá
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
