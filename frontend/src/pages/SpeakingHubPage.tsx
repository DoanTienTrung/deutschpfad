import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listSpeakingByLevel } from '../api/speakingApi'
import type { SpeakingPrompt } from '../api/types'
import { Skeleton } from '../components/ui/Skeleton'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function SpeakingHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [level, setLevel] = useState(() => searchParams.get('level') ?? 'A1')
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSearchParams({ level }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync URL when level changes
  }, [level])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- level changed, reset loading before refetch
    setLoading(true)
    listSpeakingByLevel(level)
      .then(setPrompts)
      .finally(() => setLoading(false))
  }, [level])

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="font-display text-2xl font-bold text-ink">Luyện nói</h2>
      <p className="mt-1 mb-6 text-sm text-muted">
        Chọn đề bài theo cấp độ, ghi âm câu trả lời và nhận nhận xét phát âm từ AI.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
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

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      )}

      {!loading && prompts.length === 0 && (
        <div className="rounded-md border border-dashed border-hairline p-8 text-center">
          <p className="text-3xl">🎤</p>
          <p className="mt-2 font-medium text-ink">Chưa có đề bài nào ở cấp độ này</p>
          <p className="mt-1 text-sm text-muted">Thử chọn cấp độ khác ở trên nhé.</p>
        </div>
      )}

      <ul className="space-y-2">
        {prompts.map((prompt, i) => (
          <li
            key={prompt.id}
            style={{ '--stagger-index': i % 12 } as React.CSSProperties}
            className="stagger-in rounded-lg border border-hairline bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-ink">{prompt.promptText}</p>
                {prompt.description && <p className="mt-1 text-sm text-muted">{prompt.description}</p>}
                <p className="mt-2 text-xs text-muted">
                  <span className="rounded-full bg-surface px-2 py-0.5 font-medium text-ink">{prompt.level}</span>
                </p>
              </div>
              <Link
                to={`/app/speaking/${prompt.id}`}
                className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-primary-deep"
              >
                Luyện nói
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
