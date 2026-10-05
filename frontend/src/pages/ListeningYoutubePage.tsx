import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getYoutubeLibrary } from '../api/listeningApi'
import type { ListeningExerciseSummary, YoutubeLibrary } from '../api/types'
import ExerciseGrid from '../components/listening/ExerciseGrid'
import ListeningBreadcrumb from '../components/listening/ListeningBreadcrumb'
import { CardGridSkeleton } from '../components/ui/Skeleton'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const LEVEL_ORDER: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 }
/** Số video mỗi kênh ở chế độ xem tổng quan (2 hàng trên máy tính, 3 hàng trên điện thoại). */
const PREVIEW_PER_CHANNEL = 6
/** Video chưa gắn kênh (nhập tay trước khi có khái niệm kênh) gom vào một mục riêng. */
const NO_CHANNEL = 'none'

function coversLevel(e: ListeningExerciseSummary, level: string) {
  const l = LEVEL_ORDER[level]
  return LEVEL_ORDER[e.levelMin] <= l && l <= LEVEL_ORDER[e.levelMax]
}

function channelKey(e: ListeningExerciseSummary) {
  return e.channelId != null ? String(e.channelId) : NO_CHANNEL
}

export default function ListeningYoutubePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const channel = searchParams.get('channel') ?? ''
  const level = searchParams.get('level') ?? ''
  const [library, setLibrary] = useState<YoutubeLibrary | null>(null)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getYoutubeLibrary()
      .then(setLibrary)
      .catch(() => setError(true))
  }, [])

  function update(next: { channel?: string; level?: string }) {
    const params: Record<string, string> = {}
    const c = next.channel ?? channel
    const l = next.level ?? level
    if (c) params.channel = c
    if (l) params.level = l
    setSearchParams(params, { replace: true })
  }

  const exercises = useMemo(() => library?.exercises ?? [], [library])
  const query = search.trim().toLowerCase()
  const matchesSearch = (e: ListeningExerciseSummary) => !query || e.title.toLowerCase().includes(query)

  // Kênh theo thứ tự backend trả (thứ tự đề xuất), mục "Kênh khác" cuối cùng nếu có video chưa gắn kênh.
  const channels = useMemo(() => {
    const list = (library?.channels ?? []).map((c) => ({ key: String(c.id), name: c.name }))
    if (exercises.some((e) => e.channelId == null)) list.push({ key: NO_CHANNEL, name: 'Kênh khác' })
    return list
  }, [library, exercises])
  const channelRank = new Map(channels.map((c, i) => [c.key, i]))

  // Số đếm trên chip lọc chéo: chip kênh đếm theo cấp đang chọn, chip cấp đếm theo kênh đang chọn.
  const searched = exercises.filter(matchesSearch)
  const countForChannel = (key: string) =>
    searched.filter((e) => (!key || channelKey(e) === key) && (!level || coversLevel(e, level))).length
  const countForLevel = (l: string) =>
    searched.filter((e) => (!channel || channelKey(e) === channel) && (!l || coversLevel(e, l))).length

  const filtered = searched
    .filter((e) => !channel || channelKey(e) === channel)
    .filter((e) => !level || coversLevel(e, level))
    .sort((a, b) => (channelRank.get(channelKey(a)) ?? 99) - (channelRank.get(channelKey(b)) ?? 99) || a.orderIndex - b.orderIndex)

  const overview = !channel && !level && !query
  const totalChannels = library?.channels.length ?? 0

  return (
    <div className="mx-auto max-w-5xl">
      {/* Stacks on phones: the breadcrumb needs the full 390px row to fit on one line; keeping
          the link beside it squeezed the breadcrumb into an awkward mid-item wrap. */}
      <div className="mb-2 flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <ListeningBreadcrumb
          items={[{ label: '🎧 Nghe', to: '/app/listening' }, { label: '📺 Luyện qua Video YouTube' }]}
        />
        <Link
          to="/app/listening/mine"
          className="self-start shrink-0 rounded-full border border-hairline bg-surface px-3 py-1 text-sm font-semibold text-primary transition-colors hover:border-primary/40"
        >
          🎬 Video của tôi
        </Link>
      </div>
      {library && exercises.length > 0 && (
        <p className="mb-4 text-sm text-muted">
          {exercises.length} video từ {totalChannels} kênh học tiếng Đức. Chọn kênh bạn thích hoặc chọn theo cấp độ.
        </p>
      )}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên video..."
        aria-label="Tìm video theo tên"
        className="mb-4 w-full rounded-sm border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {library && channels.length > 0 && (
        <ChipRow label="Kênh">
          <Chip active={!channel} onClick={() => update({ channel: '' })} label="Tất cả" count={countForChannel('')} />
          {channels.map((c) => (
            <Chip
              key={c.key}
              active={channel === c.key}
              onClick={() => update({ channel: channel === c.key ? '' : c.key })}
              label={c.name}
              count={countForChannel(c.key)}
            />
          ))}
        </ChipRow>
      )}
      {library && (
        <ChipRow label="Cấp độ">
          <Chip active={!level} onClick={() => update({ level: '' })} label="Tất cả" />
          {LEVELS.map((l) => (
            <Chip
              key={l}
              active={level === l}
              onClick={() => update({ level: level === l ? '' : l })}
              label={l}
              count={countForLevel(l)}
            />
          ))}
        </ChipRow>
      )}

      <div className="mt-6">
        {!library && !error && <CardGridSkeleton />}
        {error && <p className="text-danger">Không tải được danh sách video. Thử tải lại trang.</p>}

        {library && exercises.length === 0 && (
          <div className="rounded-md border border-dashed border-hairline p-8 text-center">
            <p className="text-3xl">📺</p>
            <p className="mt-2 font-medium text-ink">Chưa có video nào</p>
            <p className="mt-1 text-sm text-muted">Bạn có thể tự thêm video ở "Video của tôi".</p>
          </div>
        )}

        {library && exercises.length > 0 && overview && (
          <div className="space-y-10">
            {channels.map((c) => {
              const videos = filtered.filter((e) => channelKey(e) === c.key)
              if (videos.length === 0) return null
              return (
                <section key={c.key} aria-labelledby={`channel-${c.key}`}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h2 id={`channel-${c.key}`} className="font-display text-lg font-bold text-ink">
                      {c.name} <span className="text-sm font-normal text-muted">· {videos.length} video</span>
                    </h2>
                    {videos.length > PREVIEW_PER_CHANNEL && (
                      <button
                        onClick={() => update({ channel: c.key })}
                        className="shrink-0 text-sm font-semibold text-primary hover:underline"
                      >
                        Xem tất cả →
                      </button>
                    )}
                  </div>
                  <ExerciseGrid exercises={videos.slice(0, PREVIEW_PER_CHANNEL)} />
                </section>
              )
            })}
          </div>
        )}

        {library && exercises.length > 0 && !overview && (
          <>
            {filtered.length === 0 ? (
              <p className="text-muted">
                {query ? 'Không tìm thấy video nào khớp với tên bạn tìm.' : 'Kênh này chưa có video ở cấp độ đã chọn.'}{' '}
                Thử bỏ bớt bộ lọc.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted">{filtered.length} video</p>
                <ExerciseGrid exercises={filtered} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** Một hàng chip có nhãn. Trên điện thoại cuộn ngang trong hàng (trang không bị cuộn ngang), từ sm trở lên xuống dòng. */
function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="w-14 shrink-0 pt-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <div role="group" aria-label={label} className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
        {children}
      </div>
    </div>
  )
}

function Chip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count?: number }) {
  const empty = count === 0 && !active
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      disabled={empty}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary/12 text-primary-deep'
          : 'border border-hairline bg-surface text-ink hover:border-primary/40 hover:text-primary disabled:cursor-default disabled:opacity-45 disabled:hover:border-hairline disabled:hover:text-ink'
      }`}
    >
      {label}
      {count != null && <span className={`ml-1.5 text-xs ${active ? 'text-primary-deep/80' : 'text-muted'}`}>{count}</span>}
    </button>
  )
}
