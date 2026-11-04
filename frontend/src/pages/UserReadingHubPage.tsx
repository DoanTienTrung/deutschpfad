import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, EmptyState, Input, NativeSelect, Note, Textarea } from '@kit'
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
    <div className="mx-auto max-w-lesen">
      <nav className="mb-4 text-sm text-radiert">
        <Button variant="ghost" onClick={() => navigate('/app/reading')}>
          Đọc
        </Button>
        {' / '}Bài đọc của tôi
      </nav>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-bleistift">Bài đọc của tôi</h2>
        <Button variant="primary"
          onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Đóng' : '+ Thêm bài đọc'}
        </Button>
      </div>

      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      {showForm && (
        <div className="mb-6 rounded-karte border border-kartenrand bg-karteikarte p-5">
          <p className="mb-1 font-display text-lg font-semibold text-bleistift">Thêm bài đọc</p>
          <p className="mb-4 text-sm text-radiert">
            Dán bài báo, trích đoạn sách bạn muốn luyện đọc - hệ thống sẽ tự soạn câu hỏi ôn tập.
          </p>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề"
            className="mb-2 w-full"
          />
          <NativeSelect
            value={levelMin}
            onChange={(e) => setLevelMin(e.target.value)}
            className="mb-2"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>Cấp độ {l}</option>
            ))}
          </NativeSelect>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Dán nội dung bài đọc (tiếng Đức)"
            rows={8}
            className="mb-2 w-full"
          />
          <Input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Link nguồn (tuỳ chọn)"
            className="w-full"
          />
          <Button variant="primary" className="mt-3 w-full disabled:opacity-50"
            onClick={handleStart}
            disabled={saving || !title.trim() || !content.trim()}>
            {saving ? 'Đang tạo câu hỏi ôn tập...' : 'Bắt đầu luyện tập'}
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-karte bg-karteikarte-innen" />
          ))}
        </div>
      )}
      {!loading && passages.length === 0 && (
        <EmptyState title="Bạn chưa thêm bài đọc nào" description='Bấm "+ Thêm bài đọc" để dán bài báo/trích đoạn sách đầu tiên nhé.' />
      )}

      <ul className="space-y-2">
        {passages.map((passage, i) => (
          <li
            key={passage.id}
            style={{ '--stagger-index': i % 12 } as React.CSSProperties}
            className="stagger-in flex items-center justify-between gap-3 rounded-karte border border-kartenrand bg-karteikarte p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <Link to={`/app/reading/${passage.id}`} className="min-w-0 flex-1 font-medium text-bleistift hover:text-bleistift">
              {passage.title}
              <span className="mt-1 flex items-center gap-2 text-xs font-normal text-radiert">
                <span className="rounded-rund bg-karteikarte-innen px-2 py-0.5 font-medium text-bleistift">{passage.levelMin}</span>
                {passage.questionCount} câu hỏi
              </span>
            </Link>
            <Button variant="ghost" size="sm" className="shrink-0 text-rotstift" onClick={() => handleDelete(passage.id)}>
              Xoá
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
