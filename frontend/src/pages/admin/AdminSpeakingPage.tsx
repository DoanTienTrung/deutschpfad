import { useEffect, useState } from 'react'
import {
  listSpeakingAdmin,
  createSpeakingPrompt,
  updateSpeakingPrompt,
  deleteSpeakingPrompt,
} from '../../api/speakingApi'
import type { SpeakingPrompt } from '../../api/types'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function AdminSpeakingPage() {
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [level, setLevel] = useState('A1')
  const [promptText, setPromptText] = useState('')
  const [description, setDescription] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setPrompts(await listSpeakingAdmin())
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  function resetForm() {
    setEditingId(null)
    setLevel('A1')
    setPromptText('')
    setDescription('')
    setOrderIndex(1)
  }

  function startEdit(prompt: SpeakingPrompt) {
    setEditingId(prompt.id)
    setLevel(prompt.level)
    setPromptText(prompt.promptText)
    setDescription(prompt.description ?? '')
    setOrderIndex(prompt.orderIndex)
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      const request = { level, promptText, description: description || null, orderIndex }
      if (editingId) {
        await updateSpeakingPrompt(editingId, request)
      } else {
        await createSpeakingPrompt(request)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteSpeakingPrompt(id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Đề bài Nói</h2>

      {error && <div className="mb-4 rounded-sm bg-danger-bg p-3 text-sm text-danger">{error}</div>}

      <div className="mb-6 grid grid-cols-1 gap-2 rounded-sm border border-hairline bg-white p-4 sm:grid-cols-2">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-sm border border-hairline px-3 py-2"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
          placeholder="Thứ tự"
          className="rounded-sm border border-hairline px-3 py-2"
        />
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Đề bài (câu hỏi/yêu cầu học viên trả lời bằng giọng nói)"
          rows={3}
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ghi chú thêm (tuỳ chọn)"
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <div className="col-span-2 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-sm bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : editingId ? 'Cập nhật đề bài' : 'Thêm đề bài'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="rounded-sm border border-hairline px-4 py-2 text-ink">
              Huỷ
            </button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {prompts.map((prompt) => (
          <li
            key={prompt.id}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <span>
              <strong>{prompt.level}</strong> — Bài {prompt.orderIndex}: {prompt.promptText}
            </span>
            <span className="flex shrink-0 gap-3">
              <button onClick={() => startEdit(prompt)} className="text-sm text-primary hover:underline">
                Sửa
              </button>
              <button onClick={() => handleDelete(prompt.id)} className="text-sm text-danger hover:underline">
                Xoá
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
