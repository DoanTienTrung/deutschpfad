import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  listMyListeningItems,
  createMyListeningItem,
  deleteMyListeningItem,
  getYoutubeVideoTitle,
} from '../api/userListeningApi'
import { extractYoutubeVideoId } from '../api/listeningApi'
import type { UserListeningItemSummary } from '../api/types'
import { ApiError } from '../api/client'
import { getYoutubeThumbnailUrl, formatDuration } from '../lib/youtubeThumbnail'

export default function UserListeningHubPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<UserListeningItemSummary[]>([])
  const [loading, setLoading] = useState(true)

  const [videoLink, setVideoLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    listMyListeningItems()
      .then(setItems)
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
      const videoId = extractYoutubeVideoId(videoLink)
      const titleResult = await getYoutubeVideoTitle(videoId).catch(() => ({ title: null }))

      const result = await createMyListeningItem({
        title: titleResult.title ?? videoId,
        youtubeVideoId: videoId,
        description: null,
        rawTranscript: null,
        autoFetch: true,
      })

      if (result.sentences.length === 0) {
        await deleteMyListeningItem(result.id)
        setError('Video này chưa có phụ đề tiếng Đức (CC), thử dán link video khác nhé.')
        return
      }

      navigate(`/app/listening/mine/${result.id}`)
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
      await deleteMyListeningItem(id)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <nav className="mb-4 text-sm text-muted">
        <button onClick={() => navigate('/app/listening')} className="text-primary hover:underline">
          Nghe
        </button>
        {' / '}Video của tôi
      </nav>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">Video của tôi</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-primary-deep"
        >
          {showForm ? 'Đóng' : '+ Thêm video'}
        </button>
      </div>

      {error && <div className="mb-4 rounded-sm bg-danger-bg p-3 text-sm text-danger">{error}</div>}

      {showForm && (
        <div className="mb-6 rounded-lg border border-hairline bg-white p-5">
          <p className="mb-1 font-display text-lg font-semibold text-ink">Thêm Video</p>
          <p className="mb-4 text-sm text-muted">Dán link YouTube để luyện nghe</p>
          <input
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-sm border border-hairline px-3.5 py-2.5 text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-2 text-xs text-muted">
            Video cần có <strong>phụ đề tiếng Đức (CC)</strong> để hoạt động.
          </p>
          <button
            onClick={handleStart}
            disabled={saving || !videoLink}
            className="mt-3 w-full rounded-md bg-primary px-4 py-2.5 font-medium text-canvas transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {saving ? 'Đang xử lý...' : '→ Bắt đầu luyện tập'}
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      )}
      {!loading && items.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline p-8 text-center">
          <p className="text-3xl">🎬</p>
          <p className="mt-2 font-medium text-ink">Bạn chưa thêm video nào</p>
          <p className="mt-1 text-sm text-muted">Bấm "+ Thêm video" và dán link YouTube có phụ đề tiếng Đức nhé.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.id}>
            <Link to={`/app/listening/mine/${item.id}`} className="group">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-surface">
                <img
                  src={getYoutubeThumbnailUrl(item.youtubeVideoId)}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {item.durationSeconds != null && (
                  <span className="absolute bottom-2 right-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                    {formatDuration(item.durationSeconds)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold text-ink group-hover:text-primary">{item.title}</p>
            </Link>
            <div className="mt-0.5 flex items-center justify-between">
              <p className="text-xs text-muted">{item.sentenceCount} câu</p>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs text-danger hover:underline"
              >
                Xoá
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
