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
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
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
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
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
        <h2 className="font-display text-xl font-bold text-ink">Bài đọc của tôi</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-canvas hover:bg-primary-deep"
        >
          {showForm ? 'Đóng' : '+ Thêm bài đọc'}
        </button>
      </div>

      {error && <div className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {showForm && (
        <div className="mb-6 rounded-md border border-hairline bg-white p-4">
          <p className="mb-1 font-display text-lg font-bold text-ink">Thêm bài đọc</p>
          <p className="mb-3 text-sm text-muted">
            Dán bài báo, trích đoạn sách bạn muốn luyện đọc — hệ thống sẽ tự soạn câu hỏi ôn tập.
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề"
            className="mb-2 w-full rounded-sm border border-hairline px-3 py-2"
          />
          <select
            value={levelMin}
            onChange={(e) => setLevelMin(e.target.value)}
            className="mb-2 rounded-sm border border-hairline px-3 py-2"
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
            className="mb-2 w-full rounded-sm border border-hairline px-3 py-2"
          />
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Link nguồn (tuỳ chọn)"
            className="w-full rounded-sm border border-hairline px-3 py-2"
          />
          <button
            onClick={handleStart}
            disabled={saving || !title.trim() || !content.trim()}
            className="mt-3 w-full rounded-sm bg-primary px-4 py-2.5 font-medium text-canvas hover:bg-primary-deep disabled:opacity-50"
          >
            {saving ? 'Đang tạo câu hỏi ôn tập...' : '→ Bắt đầu luyện tập'}
          </button>
        </div>
      )}

      {loading && <p className="text-muted">Đang tải...</p>}
      {!loading && passages.length === 0 && <p className="text-muted">Bạn chưa thêm bài đọc nào.</p>}

      <ul className="space-y-2">
        {passages.map((passage) => (
          <li
            key={passage.id}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <Link to={`/app/reading/${passage.id}`} className="text-sm font-semibold text-ink hover:text-primary">
              {passage.title}
              <span className="ml-2 text-xs font-normal text-muted">
                {passage.levelMin} · {passage.questionCount} câu hỏi
              </span>
            </Link>
            <button onClick={() => handleDelete(passage.id)} className="text-xs text-red-600 hover:underline">
              Xoá
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
