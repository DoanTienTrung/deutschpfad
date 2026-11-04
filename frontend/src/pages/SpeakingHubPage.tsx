import { useEffect, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mic } from 'lucide-react'
import { Badge, ButtonLink, Card, Chip, EmptyState, PageHeader, Skeleton } from '@kit'
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
    <div className="mx-auto max-w-lesen">
      <PageHeader title="Luyện nói" description="Chọn đề bài theo cấp độ, ghi âm câu trả lời và nhận nhận xét phát âm từ AI." />

      <div className="mb-6 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>
            {l}
          </Chip>
        ))}
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!loading && prompts.length === 0 && (
        <EmptyState icon={<Mic />} title="Chưa có đề bài nào ở cấp độ này" description="Thử chọn cấp độ khác ở trên nhé." />
      )}

      <ul className="space-y-2">
        {prompts.map((prompt, i) => (
          <li key={prompt.id} style={{ '--stagger-index': i % 12 } as CSSProperties} className="stagger-in">
            <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-bleistift">{prompt.promptText}</p>
                {prompt.description && <p className="mt-1 text-sm text-radiert">{prompt.description}</p>}
                <p className="mt-2 text-xs text-radiert">
                  <Badge>{prompt.level}</Badge>
                </p>
              </div>
              <ButtonLink to={`/app/speaking/${prompt.id}`} size="sm" className="shrink-0">
                Luyện nói
              </ButtonLink>
            </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
