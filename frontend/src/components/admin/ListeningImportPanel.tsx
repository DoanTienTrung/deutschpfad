import { useEffect, useState } from 'react'
import { Button, Checkbox, Input, NativeSelect, Note } from '@kit'
import {
  applyListeningCatalog,
  enqueueListeningVideos,
  getListeningCatalog,
  getListeningImportStatus,
  previewPlaylist,
  runListeningImport,
  type CatalogVideo,
  type ListeningChannelAdmin,
  type ListeningImportStatus,
  type PlaylistPreviewEntry,
} from '../../api/listeningApi'
import { ApiError } from '../../api/client'
import { formatDuration } from '../../lib/youtubeThumbnail'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

const STATUS_LABELS: { key: keyof ListeningImportStatus['byStatus']; label: string }[] = [
  { key: 'PENDING', label: 'Chờ lấy phụ đề' },
  { key: 'TRANSLATING', label: 'Đang chờ dịch' },
  { key: 'READY', label: 'Đã hiện' },
  { key: 'FAILED', label: 'Lỗi' },
  { key: 'HIDDEN', label: 'Đã ẩn' },
]

function messageOf(err: unknown, fallback: string) {
  const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
  return serverMessage || fallback
}

/**
 * Nhập video YouTube hàng loạt: nạp danh sách đề xuất hoặc chọn từ một playlist/kênh, rồi job nền lấy phụ đề
 * và dịch (chỉ Groq, có giới hạn mỗi lượt, tự chạy 02:00 mỗi đêm). Video chỉ hiện với người học khi đã dịch xong.
 */
export default function ListeningImportPanel({
  channels,
  onChanged,
}: {
  channels: ListeningChannelAdmin[]
  onChanged: () => void
}) {
  const [status, setStatus] = useState<ListeningImportStatus | null>(null)
  const [catalog, setCatalog] = useState<CatalogVideo[]>([])
  const [showCatalog, setShowCatalog] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [url, setUrl] = useState('')
  const [limit, setLimit] = useState(30)
  const [preview, setPreview] = useState<PlaylistPreviewEntry[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [channelId, setChannelId] = useState<string>('')
  const [levelMin, setLevelMin] = useState('A1')
  const [levelMax, setLevelMax] = useState('A1')

  const catalogNew = catalog.filter((v) => !v.exists).length

  useEffect(() => {
    getListeningImportStatus().then(setStatus).catch(() => {})
    getListeningCatalog().then(setCatalog).catch(() => {})
  }, [])

  // Job chạy nền tới vài chục phút: hỏi tiến độ mỗi 3 giây trong lúc chạy, xong thì tải lại danh sách bài.
  useEffect(() => {
    if (!status?.running) return
    const timer = setInterval(() => {
      getListeningImportStatus()
        .then((s) => {
          setStatus(s)
          if (!s.running) onChanged()
        })
        .catch(() => {})
    }, 3000)
    return () => clearInterval(timer)
  }, [status?.running, onChanged])

  async function act(fn: () => Promise<string | null>, fallback: string) {
    setError(null)
    setMessage(null)
    setBusy(true)
    try {
      setMessage(await fn())
    } catch (err) {
      setError(messageOf(err, fallback))
    } finally {
      setBusy(false)
    }
  }

  const handleApplyCatalog = () =>
    act(async () => {
      const { created } = await applyListeningCatalog()
      setCatalog(await getListeningCatalog())
      setStatus(await getListeningImportStatus())
      onChanged()
      return `Đã thêm ${created} video vào hàng chờ. Bấm "Chạy nhập ngay" hoặc để job tự chạy lúc 02:00.`
    }, 'Không nạp được danh sách đề xuất')

  const handleRun = () =>
    act(async () => {
      const { started } = await runListeningImport()
      setStatus(await getListeningImportStatus())
      return started ? null : 'Đang có một lượt chạy.'
    }, 'Không bắt đầu được lượt nhập')

  const handlePreview = () =>
    act(async () => {
      const entries = await previewPlaylist(url.trim(), limit)
      setPreview(entries)
      setSelected(new Set(entries.filter((e) => !e.exists).map((e) => e.videoId)))
      return entries.length === 0 ? 'Không đọc được video nào từ link này.' : null
    }, 'Không đọc được playlist')

  const handleEnqueue = () =>
    act(async () => {
      const videos = (preview ?? [])
        .filter((e) => selected.has(e.videoId))
        .map(({ videoId, title, durationSeconds }) => ({ videoId, title, durationSeconds }))
      const { created } = await enqueueListeningVideos({
        channelId: channelId ? Number(channelId) : null,
        levelMin,
        levelMax,
        videos,
      })
      setPreview(null)
      setSelected(new Set())
      setUrl('')
      setStatus(await getListeningImportStatus())
      setCatalog(await getListeningCatalog())
      onChanged()
      return `Đã thêm ${created} video vào hàng chờ.`
    }, 'Không thêm được video')

  function toggle(videoId: string) {
    const next = new Set(selected)
    if (next.has(videoId)) next.delete(videoId)
    else next.add(videoId)
    setSelected(next)
  }

  return (
    <div className="mb-6 space-y-4 rounded-karte border border-kartenrand bg-karteikarte p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-bleistift">Nhập video YouTube hàng loạt</p>
          <p className="mt-0.5 text-radiert">
            Job lấy phụ đề và dịch (chỉ Groq, tối đa {status?.maxVideosPerRun ?? 30} video và{' '}
            {status?.maxSentencesPerRun ?? 1500} câu mỗi lượt, tự chạy 02:00 mỗi đêm). Video dịch xong mới hiện với
            người học.
          </p>
        </div>
        <Button variant="primary" className="shrink-0 disabled:opacity-40"
          onClick={handleRun}
          disabled={busy || !status || status.running}>
          {status?.running ? 'Đang chạy...' : 'Chạy nhập ngay'}
        </Button>
      </div>

      {status && (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            {STATUS_LABELS.map(({ key, label }) => (
              <span key={key} className="rounded-rund border border-linie bg-karteikarte-innen px-2.5 py-0.5 text-xs text-bleistift">
                {label}: <strong>{status.byStatus[key] ?? 0}</strong>
              </span>
            ))}
            <span className="rounded-rund border border-linie bg-karteikarte-innen px-2.5 py-0.5 text-xs text-bleistift">
              Câu chờ dịch: <strong>{status.sentencesRemaining}</strong>
            </span>
          </div>
          {status.running && (
            <p className="text-radiert">
              {status.phase}... đã lấy phụ đề {status.videosProcessed} video, dịch {status.sentencesTranslated} câu,{' '}
              {status.videosReady} video đã hiện
            </p>
          )}
          {!status.running && status.stopReason && <p className="text-rotstift">{status.stopReason}</p>}
        </div>
      )}

      {error && <Note tone="bad">{error}</Note>}
      {message && <Note tone="ok">{message}</Note>}

      <div className="border-t border-linie pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-bleistift">
            Danh sách đề xuất: <strong>{catalog.length}</strong> video ({catalogNew} chưa có)
            <Button variant="ghost" className="ml-2" onClick={() => setShowCatalog(!showCatalog)}>
              {showCatalog ? 'Ẩn' : 'Xem'}
            </Button>
          </p>
          <Button variant="secondary" size="sm" className="disabled:opacity-40"
            onClick={handleApplyCatalog}
            disabled={busy || catalogNew === 0}>
            Nạp {catalogNew} video vào hàng chờ
          </Button>
        </div>
        {showCatalog && (
          <div className="mt-2 max-h-72 overflow-auto rounded-karte border border-linie">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-karteikarte-innen text-radiert">
                <tr>
                  <th className="px-2 py-1.5">Kênh</th>
                  <th className="px-2 py-1.5">Cấp</th>
                  <th className="px-2 py-1.5">Video</th>
                  <th className="px-2 py-1.5">Dài</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((v) => (
                  <tr key={v.videoId} className={`border-t border-linie ${v.exists ? 'text-radiert' : 'text-bleistift'}`}>
                    <td className="whitespace-nowrap px-2 py-1">{v.channelName}</td>
                    <td className="whitespace-nowrap px-2 py-1">{v.levelMin === v.levelMax ? v.levelMin : `${v.levelMin}-${v.levelMax}`}</td>
                    <td className="px-2 py-1">
                      <a href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {v.title}
                      </a>
                      {v.exists && <span className="ml-1">(đã có)</span>}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1">{formatDuration(v.durationSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-linie pt-4">
        <p className="text-bleistift">Hoặc chọn từ một playlist / kênh / video YouTube:</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=... hoặc https://www.youtube.com/@kenh/videos"
            className="min-w-0 flex-1"
          />
          <Input
            type="number"
            min={1}
            max={100}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            aria-label="Số video tối đa"
            className="w-24"
          />
          <Button variant="secondary" className="disabled:opacity-40"
            onClick={handlePreview}
            disabled={busy || !url.trim()}>
            {busy ? 'Đang đọc...' : 'Xem trước'}
          </Button>
        </div>

        {preview && preview.length > 0 && (
          <div className="space-y-2">
            <div className="max-h-72 overflow-auto rounded-karte border border-linie">
              {preview.map((e) => (
                <Checkbox key={e.videoId} checked={selected.has(e.videoId)} disabled={e.exists} onChange={() => toggle(e.videoId)}
                  className="border-b border-linie px-2 last:border-0"
                  label={<span className="flex gap-2"><span className="min-w-0 flex-1 truncate">{e.title}</span>
                    <span className="shrink-0 text-xs text-radiert">{e.exists ? 'đã có' : formatDuration(e.durationSeconds)}</span></span>} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <NativeSelect value={channelId} onChange={(e) => setChannelId(e.target.value)} className="sm:col-span-2">
                <option value="">Kênh: tự nhận từ YouTube</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </NativeSelect>
              <NativeSelect value={levelMin} onChange={(e) => setLevelMin(e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>Từ {l}</option>)}
              </NativeSelect>
              <NativeSelect value={levelMax} onChange={(e) => setLevelMax(e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>Đến {l}</option>)}
              </NativeSelect>
            </div>
            <Button variant="primary" className="w-full disabled:opacity-40"
              onClick={handleEnqueue}
              disabled={busy || selected.size === 0}>
              Thêm {selected.size} video vào hàng chờ
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
