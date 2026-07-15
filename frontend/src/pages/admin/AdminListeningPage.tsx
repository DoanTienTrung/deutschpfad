import { useEffect, useState } from 'react'
import {
  listListeningAdmin,
  createListeningExercise,
  updateListeningExercise,
  deleteListeningExercise,
  extractYoutubeVideoId,
  getYoutubeVideoTitle,
} from '../../api/listeningApi'
import type { ListeningExerciseAdmin } from '../../api/types'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function AdminListeningPage() {
  const [exercises, setExercises] = useState<ListeningExerciseAdmin[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [levelMin, setLevelMin] = useState('A1')
  const [levelMax, setLevelMax] = useState('A1')
  const [youtubeVideoId, setYoutubeVideoId] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [description, setDescription] = useState('')
  const [topic, setTopic] = useState('')
  const [rawTranscript, setRawTranscript] = useState('')
  const [autoFetch, setAutoFetch] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const topicSuggestions = [...new Set(exercises.map((e) => e.topic).filter((t): t is string => !!t))].sort()

  async function load() {
    setExercises(await listListeningAdmin())
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setLevelMin('A1')
    setLevelMax('A1')
    setYoutubeVideoId('')
    setOrderIndex(1)
    setDescription('')
    setTopic('')
    setRawTranscript('')
    setAutoFetch(true)
  }

  function startEdit(exercise: ListeningExerciseAdmin) {
    setEditingId(exercise.id)
    setTitle(exercise.title)
    setLevelMin(exercise.levelMin)
    setLevelMax(exercise.levelMax)
    setYoutubeVideoId(exercise.youtubeVideoId)
    setOrderIndex(exercise.orderIndex)
    setDescription(exercise.description ?? '')
    setTopic(exercise.topic ?? '')
    setRawTranscript('')
    setAutoFetch(false)
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
        youtubeVideoId: extractYoutubeVideoId(youtubeVideoId),
        description: description || null,
        topic: topic || null,
        orderIndex,
        rawTranscript: rawTranscript || null,
        autoFetch,
      }
      const result = editingId
        ? await updateListeningExercise(editingId, request)
        : await createListeningExercise(request)

      if (result.sentences.length === 0) {
        setLastResult('Đã lưu, nhưng chưa có câu nào — video không có phụ đề tự động lấy được, hãy dán transcript tay.')
      } else if (result.autoFetched) {
        setLastResult(`Đã tự động lấy được ${result.sentences.length} câu từ phụ đề YouTube.`)
      } else {
        setLastResult(`Đã lưu ${result.sentences.length} câu.`)
      }

      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
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

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteListeningExercise(id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Bài nghe</h2>

      {error && <div className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {lastResult && <div className="mb-4 rounded-sm bg-success-bg p-3 text-sm text-success">{lastResult}</div>}

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-sm border border-hairline bg-white p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên bài nghe"
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
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
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả (tuỳ chọn)"
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Chủ đề (vd. Erziehung, Gastronomie...)"
          list="topic-suggestions"
          className="col-span-2 rounded-sm border border-hairline px-3 py-2"
        />
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
          className="col-span-2 rounded-sm border border-hairline px-3 py-2 font-mono text-xs"
        />
        <label className="col-span-2 flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={autoFetch} onChange={(e) => setAutoFetch(e.target.checked)} />
          Tự động lấy phụ đề qua yt-dlp (bỏ qua nếu đã dán transcript ở trên)
        </label>
        <p className="col-span-2 text-xs text-muted">
          {editingId
            ? 'Sửa bài: để trống transcript và bỏ tick ô trên nếu không muốn đổi lại các câu đã có. Tick ô trên để thử lấy lại phụ đề tự động (ghi đè câu cũ).'
            : 'Tạo mới: để trống transcript, hệ thống sẽ tự thử lấy phụ đề qua yt-dlp; nếu video không có phụ đề, hãy dán tay.'}
        </p>
        <div className="col-span-2 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-sm bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
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

      <ul className="space-y-2">
        {exercises.map((exercise) => (
          <li
            key={exercise.id}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <span>
              <strong>{exercise.levelMin === exercise.levelMax ? exercise.levelMin : `${exercise.levelMin}-${exercise.levelMax}`}</strong> — Bài {exercise.orderIndex}: {exercise.title}
              {exercise.topic && <span className="ml-2 text-xs text-muted">#{exercise.topic}</span>}
              <span className="ml-2 text-xs text-muted">[{exercise.sentences.length} câu]</span>
            </span>
            <span className="flex gap-3">
              <button onClick={() => startEdit(exercise)} className="text-sm text-primary hover:underline">
                Sửa
              </button>
              <button onClick={() => handleDelete(exercise.id)} className="text-sm text-red-600 hover:underline">
                Xoá
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
