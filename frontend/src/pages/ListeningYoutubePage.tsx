import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listListeningByLevel } from '../api/listeningApi'
import type { ListeningExerciseSummary } from '../api/types'
import ExerciseGrid from '../components/listening/ExerciseGrid'
import ListeningBreadcrumb from '../components/listening/ListeningBreadcrumb'
import { CardGridSkeleton } from '../components/ui/Skeleton'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function ListeningYoutubePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A1')
  const [topic, setTopic] = useState(() => searchParams.get('topic') ?? '')
  const [exercises, setExercises] = useState<ListeningExerciseSummary[]>([])
  const [allTopics, setAllTopics] = useState<string[]>([])
  const [topicLevels, setTopicLevels] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const youtubeOnly = exercises.filter((e) => e.youtubeVideoId)
  const visibleExercises = youtubeOnly
    .filter((e) => e.title.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((e) => !topic || e.topic === topic)
  const topicMissingAtLevel = topic && topicLevels[topic] && !topicLevels[topic].includes(level)

  useEffect(() => {
    setSearchParams(topic ? { level, topic } : { level }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync URL when level/topic changes
  }, [level, topic])

  useEffect(() => {
    // topic list spans every level (eg. "Erziehung" currently only has B1 videos), so it's
    // fetched once across all levels instead of from the currently-selected level's subset --
    // otherwise the dropdown would appear/disappear as the user switches levels.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    Promise.all(LEVELS.map((l) => listListeningByLevel(l))).then((results) => {
      const merged = results.flatMap((exs, i) => exs.filter((e) => e.youtubeVideoId).map((e) => ({ ...e, __level: LEVELS[i] })))
      setAllTopics([...new Set(merged.map((e) => e.topic).filter((t): t is string => !!t))])
      const levelsByTopic: Record<string, string[]> = {}
      for (const e of merged) {
        if (!e.topic) continue
        levelsByTopic[e.topic] ??= []
        if (!levelsByTopic[e.topic].includes(e.__level)) levelsByTopic[e.topic].push(e.__level)
      }
      setTopicLevels(levelsByTopic)
    })
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- level changed, reset loading before refetch
    setLoading(true)
    listListeningByLevel(level)
      .then(setExercises)
      .finally(() => setLoading(false))
  }, [level])

  function handleTopicChange(newTopic: string) {
    setTopic(newTopic)
    // picking a topic is the user's new intent -- jump straight to a level that actually has it,
    // instead of leaving them on the current level staring at an empty result
    if (newTopic && topicLevels[newTopic] && !topicLevels[newTopic].includes(level)) {
      setLevel(topicLevels[newTopic][0])
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Stacks on phones: the breadcrumb needs the full 390px row to fit on one line; keeping
          the link beside it squeezed the breadcrumb into an awkward mid-item wrap. */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-3">
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

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên video..."
        className="mb-4 w-full rounded-sm border border-hairline px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                level === l
                  ? 'bg-primary/12 text-primary-deep'
                  : 'border border-hairline bg-surface text-ink hover:border-primary/40 hover:text-primary'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        {allTopics.length > 0 && (
          <select
            value={topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
          >
            <option value="">Tất cả chủ đề</option>
            {allTopics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
      </div>

      {loading && <CardGridSkeleton />}

      {!loading && topicMissingAtLevel && (
        <p className="text-muted">
          Chủ đề <span className="font-semibold text-ink">{topic}</span> hiện chỉ có ở cấp{' '}
          <span className="font-semibold text-ink">{topicLevels[topic].join(', ')}</span>. Nếu muốn luyện chủ đề
          này ở cấp {level}, bạn có thể tự thêm video theo ý muốn ở mục{' '}
          <Link to="/app/listening/mine" className="font-medium text-primary hover:underline">
            🎬 Video của tôi
          </Link>
          .
        </p>
      )}
      {!loading && !topicMissingAtLevel && youtubeOnly.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline p-8 text-center">
          <p className="text-3xl">📺</p>
          <p className="mt-2 font-medium text-ink">Chưa có video nào ở cấp độ này</p>
          <p className="mt-1 text-sm text-muted">Thử chọn cấp độ khác, hoặc tự thêm video ở "Video của tôi".</p>
        </div>
      )}
      {!loading && !topicMissingAtLevel && youtubeOnly.length > 0 && visibleExercises.length === 0 && (
        <p className="text-muted">Không tìm thấy video nào khớp với tên bạn tìm.</p>
      )}

      <ExerciseGrid exercises={visibleExercises} />
    </div>
  )
}
