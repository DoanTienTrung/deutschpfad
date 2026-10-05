import { useCallback, useEffect, useState } from 'react'
import {
  listListeningAdmin,
  createListeningExercise,
  updateListeningExercise,
  deleteListeningExercise,
  extractYoutubeVideoId,
  getYoutubeVideoTitle,
  listListeningChannels,
  retryListeningImport,
  type ListeningChannelAdmin,
} from '../../api/listeningApi'
import type { ListeningExerciseAdmin, ListeningKind, ListeningStatus } from '../../api/types'
import { ApiError } from '../../api/client'
import ListeningImportPanel from '../../components/admin/ListeningImportPanel'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

const STATUS_STYLE: Record<ListeningStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ phụ đề', className: 'bg-surface text-muted' },
  TRANSLATING: { label: 'Chờ dịch', className: 'bg-surface text-muted' },
  READY: { label: 'Đã hiện', className: 'bg-success-bg text-success' },
  FAILED: { label: 'Lỗi', className: 'bg-danger-bg text-danger' },
  HIDDEN: { label: 'Đã ẩn', className: 'bg-surface text-muted' },
}

const STATUS_FILTERS: (ListeningStatus | '')[] = ['', 'READY', 'PENDING', 'TRANSLATING', 'FAILED', 'HIDDEN']

export default function AdminListeningPage() {
  const [exercises, setExercises] = useState<ListeningExerciseAdmin[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [levelMin, setLevelMin] = useState('A1')
  const [levelMax, setLevelMax] = useState('A1')
  const [youtubeVideoId, setYoutubeVideoId] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [sourceLabel, setSourceLabel] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [description, setDescription] = useState('')
  const [topic, setTopic] = useState('')
  const [rawTranscript, setRawTranscript] = useState('')
  const [autoFetch, setAutoFetch] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [channels, setChannels] = useState<ListeningChannelAdmin[]>([])
  const [channelId, setChannelId] = useState('')
  const [kind, setKind] = useState<ListeningKind | ''>('')
  const [hidden, setHidden] = useState(false)
  const [editingStatus, setEditingStatus] = useState<ListeningStatus | null>(null)
  const [statusFilter, setStatusFilter] = useState<ListeningStatus | ''>('')

  const topicSuggestions = [...new Set(exercises.map((e) => e.topic).filter((t): t is string => !!t))].sort()
  const visibleExercises = exercises.filter((e) => !statusFilter || e.status === statusFilter)

  const load = useCallback(async () => {
    const [list, channelList] = await Promise.all([listListeningAdmin(), listListeningChannels()])
    setExercises(list)
    setChannels(channelList)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [load])

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setLevelMin('A1')
    setLevelMax('A1')
    setYoutubeVideoId('')
    setAudioUrl('')
    setSourceLabel('')
    setSourceUrl('')
    setOrderIndex(1)
    setDescription('')
    setTopic('')
    setRawTranscript('')
    setAutoFetch(true)
    setChannelId('')
    setKind('')
    setHidden(false)
    setEditingStatus(null)
  }

  function startEdit(exercise: ListeningExerciseAdmin) {
    setEditingId(exercise.id)
    setTitle(exercise.title)
    setLevelMin(exercise.levelMin)
    setLevelMax(exercise.levelMax)
    setYoutubeVideoId(exercise.youtubeVideoId ?? '')
    setAudioUrl(exercise.audioUrl ?? '')
    setSourceLabel(exercise.sourceLabel ?? '')
    setSourceUrl(exercise.sourceUrl ?? '')
    setOrderIndex(exercise.orderIndex)
    setDescription(exercise.description ?? '')
    setTopic(exercise.topic ?? '')
    setRawTranscript('')
    setAutoFetch(false)
    setChannelId(exercise.channelId != null ? String(exercise.channelId) : '')
    setKind(exercise.kind)
    setHidden(exercise.status === 'HIDDEN')
    setEditingStatus(exercise.status)
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    setLastResult(null)
    try {
      const request = {
        title,
        levelMin,
        levelMax,
        youtubeVideoId: youtubeVideoId.trim() ? extractYoutubeVideoId(youtubeVideoId) : null,
        audioUrl: audioUrl.trim() || null,
        sourceLabel: sourceLabel.trim() || null,
        sourceUrl: sourceUrl.trim() || null,
        description: description || null,
        topic: topic || null,
        orderIndex,
        rawTranscript: rawTranscript || null,
        autoFetch,
        channelId: channelId ? Number(channelId) : null,
        kind: kind || null,
        hidden: editingStatus === 'READY' || editingStatus === 'HIDDEN' ? hidden : null,
      }
      const result = editingId
        ? await updateListeningExercise(editingId, request)
        : await createListeningExercise(request)

      if (result.sentences.length === 0) {
        setLastResult('Đã lưu, nhưng chưa có câu nào - video không có phụ đề tự động lấy được, hãy dán transcript tay.')
      } else if (result.autoFetched) {
        setLastResult(`Đã tự động lấy được ${result.sentences.length} câu từ phụ đề YouTube.`)
      } else {
        setLastResult(`Đã lưu ${result.sentences.length} câu.`)
      }

      resetForm()
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra (server phản hồi quá lâu hoặc gặp sự cố) - kiểm tra lại danh sách bên dưới, bài có thể đã được lưu.')
    } finally {
      setSaving(false)
    }
  }

  async function handleVideoLinkBlur() {
    if (title.trim() || !youtubeVideoId.trim()) return
    const videoId = extractYoutubeVideoId(youtubeVideoId)
    const result = await getYoutubeVideoTitle(videoId).catch(() => ({ title: null }))
    if (result.title) setTitle(result.title)
  }

  async function handleRetry(id: number) {
    setError(null)
    try {
      await retryListeningImport(id)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteListeningExercise(id)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Bài nghe</h2>

      {error && <div className="mb-4 rounded-sm bg-danger-bg p-3 text-sm text-danger">{error}</div>}
      {lastResult && <div className="mb-4 rounded-sm bg-success-bg p-3 text-sm text-success">{lastResult}</div>}

      <ListeningImportPanel channels={channels} onChanged={load} />

      <div className="mb-6 grid grid-cols-1 gap-2 rounded-sm border border-hairline bg-card p-4 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên bài nghe"
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <select
          value={levelMin}
          onChange={(e) => setLevelMin(e.target.value)}
          className="rounded-sm border border-hairline px-3 py-2"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>Từ {l}</option>
          ))}
        </select>
        <select
          value={levelMax}
          onChange={(e) => setLevelMax(e.target.value)}
          className="rounded-sm border border-hairline px-3 py-2"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>Đến {l}</option>
          ))}
        </select>
        <input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
          placeholder="Thứ tự"
          className="rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={youtubeVideoId}
          onChange={(e) => setYoutubeVideoId(e.target.value)}
          onBlur={handleVideoLinkBlur}
          placeholder="Dán link YouTube (bất kỳ dạng nào) hoặc mã video, vd. dQw4w9WgXcQ"
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <p className="sm:col-span-2 text-xs text-muted">
          - hoặc, cho bài nghe không phải YouTube (vd. đề thi Goethe Modellsatz) -
        </p>
        <input
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="Link file audio trực tiếp (mp3/mp4), thay cho YouTube"
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={sourceLabel}
          onChange={(e) => setSourceLabel(e.target.value)}
          placeholder="Tên nguồn hiển thị (vd. Goethe-Institut Modellsatz B1 – Hören Teil 2)"
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="Link gốc tới nguồn (tuỳ chọn)"
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả (tuỳ chọn)"
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Chủ đề (vd. Erziehung, Gastronomie...)"
          list="topic-suggestions"
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <select
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          className="rounded-sm border border-hairline px-3 py-2"
        >
          <option value="">Kênh: không có</option>
          {channels.map((c) => (
            <option key={c.id} value={c.id}>Kênh: {c.name}</option>
          ))}
        </select>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as ListeningKind | '')}
          className="rounded-sm border border-hairline px-3 py-2"
        >
          <option value="">Trang: tự chọn (có audio là đề thi)</option>
          <option value="YOUTUBE">Trang: Video YouTube</option>
          <option value="EXAM">Trang: Luyện đề thi</option>
        </select>
        {(editingStatus === 'READY' || editingStatus === 'HIDDEN') && (
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
            Ẩn bài này với người học
          </label>
        )}
        <datalist id="topic-suggestions">
          {topicSuggestions.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <textarea
          value={rawTranscript}
          onChange={(e) => setRawTranscript(e.target.value)}
          placeholder="Dán transcript từ YouTube (mở video → &quot;...&quot; → Hiển thị bản ghi → copy). Để trống để hệ thống tự động thử lấy phụ đề."
          rows={6}
          className="sm:col-span-2 rounded-sm border border-hairline px-3 py-2 font-mono text-xs"
        />
        <label className="sm:col-span-2 flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={autoFetch} onChange={(e) => setAutoFetch(e.target.checked)} />
          Tự động lấy phụ đề qua yt-dlp (bỏ qua nếu đã dán transcript ở trên)
        </label>
        <p className="sm:col-span-2 text-xs text-muted">
          {editingId
            ? 'Sửa bài: để trống transcript và bỏ tick ô trên nếu không muốn đổi lại các câu đã có. Tick ô trên để thử lấy lại phụ đề tự động (ghi đè câu cũ).'
            : 'Tạo mới: để trống transcript, hệ thống sẽ tự thử lấy phụ đề qua yt-dlp; nếu video không có phụ đề, hãy dán tay.'}
        </p>
        <div className="sm:col-span-2 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-sm bg-primary px-4 py-2 font-medium text-canvas disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : editingId ? 'Cập nhật bài nghe' : 'Thêm bài nghe'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="rounded-sm border border-hairline px-4 py-2 text-ink">
              Huỷ
            </button>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Lọc:</span>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 ${statusFilter === s ? 'bg-primary/12 text-primary-deep' : 'border border-hairline text-ink'}`}
          >
            {s ? STATUS_STYLE[s].label : 'Tất cả'} ({s ? exercises.filter((e) => e.status === s).length : exercises.length})
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {visibleExercises.map((exercise) => (
          <li
            key={exercise.id}
            className="flex items-center justify-between gap-3 rounded-sm border border-hairline bg-card p-3"
          >
            <span className="min-w-0">
              <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[exercise.status].className}`}>
                {STATUS_STYLE[exercise.status].label}
              </span>
              <strong>{exercise.levelMin === exercise.levelMax ? exercise.levelMin : `${exercise.levelMin}-${exercise.levelMax}`}</strong> - Bài {exercise.orderIndex}: {exercise.title}
              {exercise.kind === 'EXAM' && <span className="ml-2 text-xs text-muted">[đề thi]</span>}
              {exercise.channelName && <span className="ml-2 text-xs text-muted">{exercise.channelName}</span>}
              {exercise.topic && <span className="ml-2 text-xs text-muted">#{exercise.topic}</span>}
              <span className="ml-2 text-xs text-muted">[{exercise.sentenceCount} câu]</span>
              {exercise.importError && <span className="ml-2 text-xs text-danger">{exercise.importError}</span>}
            </span>
            <span className="flex shrink-0 gap-3">
              {exercise.status === 'FAILED' && (
                <button onClick={() => handleRetry(exercise.id)} className="text-sm text-primary hover:underline">
                  Thử lại
                </button>
              )}
              <button onClick={() => startEdit(exercise)} className="text-sm text-primary hover:underline">
                Sửa
              </button>
              <button onClick={() => handleDelete(exercise.id)} className="text-sm text-danger hover:underline">
                Xoá
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
