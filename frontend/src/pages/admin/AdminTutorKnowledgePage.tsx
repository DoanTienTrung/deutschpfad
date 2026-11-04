import { useEffect, useState } from 'react'
import { Button, Chip, FileInput, Input, NativeSelect, Note, Textarea } from '@kit'
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
      <h2 className="mb-4 font-display text-xl font-bold text-bleistift">Quản lý Kiến thức Gia sư (RAG)</h2>

      {error && <Note tone="bad" className="mb-4">{error}</Note>}
      {message && <Note tone="info" className="mb-4">{message}</Note>}

      <div className="mb-6 space-y-3 rounded-karte border border-kartenrand bg-karteikarte p-4">
        <div className="flex gap-2">
          <Chip selected={mode === 'upload'}
            onClick={() => setMode('upload')}>
            Upload file
          </Chip>
          <Chip selected={mode === 'paste'}
            onClick={() => setMode('paste')}>
            Dán text
          </Chip>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề (để trống dùng tên file khi upload)"
          className="w-full"
        />
        <div className="grid grid-cols-2 gap-2">
          <NativeSelect
            value={level}
            onChange={(e) => setLevel(e.target.value)}
           
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </NativeSelect>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Chủ đề (tuỳ chọn, vd. Perfekt)"
           
          />
        </div>

        {mode === 'upload' ? (
          <FileInput accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.rtf,.odt" aria-label="Tệp tài liệu"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dán nội dung ngữ pháp tiếng Đức vào đây"
            rows={8}
            className="w-full"
          />
        )}

        <Button variant="primary" className="disabled:opacity-50"
          onClick={handleSave}
          disabled={saving || !canSave}>
          {saving ? 'Đang lưu...' : 'Lưu & tạo embedding'}
        </Button>
      </div>

      <div className="mb-6">
        <Button variant="secondary" className="disabled:opacity-50"
          onClick={handleSyncVocabulary}
          disabled={syncing}>
          {syncing ? 'Đang đồng bộ...' : 'Đồng bộ từ vựng'}
        </Button>
      </div>

      <ul className="space-y-2">
        {batches.map((batch) => (
          <li
            key={batch.batchId}
            className="flex items-center justify-between rounded-karte border border-kartenrand bg-karteikarte p-3"
          >
            <span>
              <strong>{batch.title}</strong>
              {batch.level && <span className="ml-2 text-xs text-radiert">[{batch.level}]</span>}
              {batch.topic && <span className="ml-2 text-xs text-radiert">#{batch.topic}</span>}
              <span className="ml-2 text-xs text-radiert">[{batch.chunkCount} chunk]</span>
            </span>
            <Button variant="ghost" className="text-rotstift" onClick={() => handleDelete(batch.batchId)}>
              Xoá
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
