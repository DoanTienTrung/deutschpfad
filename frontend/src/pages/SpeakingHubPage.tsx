import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listSpeakingByLevel } from '../api/speakingApi'
import type { SpeakingPrompt } from '../api/types'

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
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Nói</h2>

      <div className="mb-6 flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
              level === l ? 'bg-accent/30 text-ink' : 'border border-hairline text-ink hover:bg-surface'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading && <p className="text-muted">Đang tải...</p>}

      {!loading && prompts.length === 0 && <p className="text-muted">Chưa có đề bài nào ở cấp độ này.</p>}

      <ul className="space-y-2">
        {prompts.map((prompt) => (
          <li key={prompt.id} className="rounded-md border border-hairline bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-ink">{prompt.promptText}</p>
                {prompt.description && <p className="mt-1 text-sm text-muted">{prompt.description}</p>}
                <p className="mt-1 text-xs text-muted">[{prompt.level}]</p>
              </div>
              <Link
                to={`/app/speaking/${prompt.id}`}
                className="shrink-0 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-canvas hover:bg-primary-deep"
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
