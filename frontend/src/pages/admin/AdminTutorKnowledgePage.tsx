import { useEffect, useState } from 'react'
import {
  listTutorGrammarNotes,
  createTutorGrammarNote,
  uploadTutorGrammarFile,
  deleteTutorGrammarNote,
  syncTutorVocabulary,
} from '../../api/tutorAdminApi'
import type { TutorKnowledgeBatch } from '../../api/types'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function AdminTutorKnowledgePage() {
  const [batches, setBatches] = useState<TutorKnowledgeBatch[]>([])
  const [mode, setMode] = useState<'upload' | 'paste'>('upload')
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('A1')
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setBatches(await listTutorGrammarNotes())
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  function resetForm() {
    setTitle('')
    setLevel('A1')
    setTopic('')
    setContent('')
    setFile(null)
  }

  async function handleSave() {
    setError(null)
    setMessage(null)
    setSaving(true)
    try {
      const result =
        mode === 'upload' && file
          ? await uploadTutorGrammarFile(file, title, level, topic)
          : await createTutorGrammarNote({ title, content, level, topic })
      setMessage(`Đã lưu, tạo ${result.chunksCreated} đoạn (chunk)`)
      resetForm()
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(batchId: string) {
    setError(null)
    try {
      await deleteTutorGrammarNote(batchId)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  async function handleSyncVocabulary() {
    setError(null)
    setMessage(null)
    setSyncing(true)
    try {
      const result = await syncTutorVocabulary()
      setMessage(`Đã đồng bộ ${result.chunksCreated} từ vựng`)
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    } finally {
      setSyncing(false)
    }
  }

  const canSave = mode === 'upload' ? !!file : content.trim().length > 0

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Kiến thức Gia sư (RAG)</h2>

      {error && <div className="mb-4 rounded-sm bg-danger-bg p-3 text-sm text-danger">{error}</div>}
      {message && <div className="mb-4 rounded-sm bg-accent/10 p-3 text-sm text-ink">{message}</div>}

      <div className="mb-6 space-y-3 rounded-sm border border-hairline bg-white p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('upload')}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium ${mode === 'upload' ? 'bg-primary text-white' : 'border border-hairline text-ink'}`}
          >
            Upload file
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium ${mode === 'paste' ? 'bg-primary text-white' : 'border border-hairline text-ink'}`}
          >
            Dán text
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề (để trống dùng tên file khi upload)"
          className="w-full rounded-sm border border-hairline px-3 py-2"
        />
        <div className="grid grid-cols-2 gap-2">
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
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Chủ đề (tuỳ chọn, vd. Perfekt)"
            className="rounded-sm border border-hairline px-3 py-2"
          />
        </div>

        {mode === 'upload' ? (
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.rtf,.odt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-sm border border-hairline px-3 py-2"
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dán nội dung ngữ pháp tiếng Đức vào đây"
            rows={8}
            className="w-full rounded-sm border border-hairline px-3 py-2"
          />
        )}

        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="rounded-sm bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Lưu & tạo embedding'}
        </button>
      </div>

      <div className="mb-6">
        <button
          onClick={handleSyncVocabulary}
          disabled={syncing}
          className="rounded-sm border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-accent/10 disabled:opacity-50"
        >
          {syncing ? 'Đang đồng bộ...' : 'Đồng bộ từ vựng'}
        </button>
      </div>

      <ul className="space-y-2">
        {batches.map((batch) => (
          <li
            key={batch.batchId}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <span>
              <strong>{batch.title}</strong>
              {batch.level && <span className="ml-2 text-xs text-muted">[{batch.level}]</span>}
              {batch.topic && <span className="ml-2 text-xs text-muted">#{batch.topic}</span>}
              <span className="ml-2 text-xs text-muted">[{batch.chunkCount} chunk]</span>
            </span>
            <button onClick={() => handleDelete(batch.batchId)} className="text-sm text-danger hover:underline">
              Xoá
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
