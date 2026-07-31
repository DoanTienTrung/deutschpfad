import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  listMyReadingPassages,
  createMyReadingPassage,
  deleteMyReadingPassage,
} from '../api/readingApi'
import type { ReadingPassageSummary } from '../api/types'
import { ApiError } from '../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function UserReadingHubPage() {
  const navigate = useNavigate()
  const [passages, setPassages] = useState<ReadingPassageSummary[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [levelMin, setLevelMin] = useState('B1')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    listMyReadingPassages()
      .then(setPassages)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  async function handleStart() {
    setError(null)
    setSaving(true)
    try {
      const result = await createMyReadingPassage({
        title,
        levelMin,
        levelMax: levelMin,
        content,
        sourceUrl: sourceUrl.trim() || null,
      })
      navigate(`/app/reading/${result.id}`)
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteMyReadingPassage(id)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-4 text-sm text-muted">
        <button onClick={() => navigate('/app/reading')} className="text-primary hover:underline">
          Đọc
        </button>
        {' / '}Bài đọc của tôi
      </nav>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">Bài đọc của tôi</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-primary-deep"
        >
          {showForm ? 'Đóng' : '+ Thêm bài đọc'}
        </button>
      </div>

      {error && <div className="mb-4 rounded-sm bg-danger-bg p-3 text-sm text-danger">{error}</div>}

      {showForm && (
        <div className="mb-6 rounded-lg border border-hairline bg-white p-5">
          <p className="mb-1 font-display text-lg font-semibold text-ink">Thêm bài đọc</p>
          <p className="mb-4 text-sm text-muted">
            Dán bài báo, trích đoạn sách bạn muốn luyện đọc — hệ thống sẽ tự soạn câu hỏi ôn tập.
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề"
            className="mb-2 w-full rounded-sm border border-hairline px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={levelMin}
            onChange={(e) => setLevelMin(e.target.value)}
            className="mb-2 rounded-sm border border-hairline bg-canvas px-3.5 py-2.5 text-ink focus:border-primary focus:outline-none"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>Cấp độ {l}</option>
            ))}
          </select>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dán nội dung bài đọc (tiếng Đức)"
            rows={8}
            className="mb-2 w-full rounded-sm border border-hairline px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Link nguồn (tuỳ chọn)"
            className="w-full rounded-sm border border-hairline px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleStart}
            disabled={saving || !title.trim() || !content.trim()}
            className="mt-3 w-full rounded-md bg-primary px-4 py-2.5 font-medium text-canvas transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {saving ? 'Đang tạo câu hỏi ôn tập...' : '→ Bắt đầu luyện tập'}
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      )}
      {!loading && passages.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline p-8 text-center">
          <p className="text-3xl">📚</p>
          <p className="mt-2 font-medium text-ink">Bạn chưa thêm bài đọc nào</p>
          <p className="mt-1 text-sm text-muted">Bấm "+ Thêm bài đọc" để dán bài báo/trích đoạn sách đầu tiên nhé.</p>
        </div>
      )}

      <ul className="space-y-2">
        {passages.map((passage, i) => (
          <li
            key={passage.id}
            style={{ '--stagger-index': i % 12 } as React.CSSProperties}
            className="stagger-in flex items-center justify-between gap-3 rounded-lg border border-hairline bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <Link to={`/app/reading/${passage.id}`} className="min-w-0 flex-1 font-medium text-ink hover:text-primary">
              {passage.title}
              <span className="mt-1 flex items-center gap-2 text-xs font-normal text-muted">
                <span className="rounded-full bg-surface px-2 py-0.5 font-medium text-ink">{passage.levelMin}</span>
                {passage.questionCount} câu hỏi
              </span>
            </Link>
            <button onClick={() => handleDelete(passage.id)} className="shrink-0 text-xs text-danger hover:underline">
              Xoá
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
