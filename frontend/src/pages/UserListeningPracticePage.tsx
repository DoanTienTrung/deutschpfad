import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMyListeningItem, getMyShadowingFeedback, getMyWordTranslation } from '../api/userListeningApi'
import { recordListeningProgress } from '../api/listeningApi'
import type { UserListeningItemDetail } from '../api/types'
import YouTubePlayer, { type YouTubePlayerRef } from '../components/listening/YouTubePlayer'
import ShadowingPanel from '../components/listening/ShadowingPanel'
import ListeningDictationPanel from '../components/listening/ListeningDictationPanel'
import ListeningClozePanel from '../components/listening/ListeningClozePanel'

type Mode = 'shadowing' | 'dictation' | 'cloze'

export default function UserListeningPracticePage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const id = Number(itemId)

  const [item, setItem] = useState<UserListeningItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [mode, setMode] = useState<Mode>('shadowing')
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [completedIndexes, setCompletedIndexes] = useState<Set<number>>(new Set())

  const playerRef = useRef<YouTubePlayerRef>(null)
  const sentenceRefs = useRef<Record<number, HTMLLIElement | null>>({})
  const listContainerRef = useRef<HTMLUListElement>(null)
  const hasRecordedProgressRef = useRef(false)

  function handleSentenceComplete(i: number) {
    setCompletedIndexes((prev) => new Set(prev).add(i))
    // First completed sentence in this session counts as "practiced listening today" —
    // recordActivity is idempotent per day server-side, so no need to guard beyond once per page visit.
    if (!hasRecordedProgressRef.current) {
      hasRecordedProgressRef.current = true
      recordListeningProgress().catch(() => {})
    }
  }

  useEffect(() => {
    setLoading(true)
    getMyListeningItem(id)
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id])

  // Switching sentence/mode changes the meaning of "completed" (recorded vs typed correctly),
  // so start each mode's progress fresh instead of carrying over stale checkmarks.
  useEffect(() => {
    setPracticeIndex(0)
    setCompletedIndexes(new Set())
  }, [mode])

  // Scroll only inside the sentence list itself (not the whole page) and pin the active
  // sentence around the 3rd visible row instead of snapping it to the very top/bottom —
  // scrollIntoView({block:'nearest'}) was also dragging the outer page scroll along with it.
  useEffect(() => {
    const activeId = item?.sentences[practiceIndex]?.id
    if (activeId === undefined) return
    const container = listContainerRef.current
    const el = sentenceRefs.current[activeId]
    if (!container || !el) return
    // getBoundingClientRect (viewport-relative) instead of offsetTop, since offsetTop is
    // relative to the nearest *positioned* ancestor — which isn't necessarily this container.
    const offsetWithinContainer = el.getBoundingClientRect().top - container.getBoundingClientRect().top
    const target = container.scrollTop + offsetWithinContainer - el.getBoundingClientRect().height * 2
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }, [item, practiceIndex])

  function handleSentenceClick(index: number, startSeconds: number) {
    setPracticeIndex(index)
    playerRef.current?.seekTo(startSeconds)
    playerRef.current?.play()
  }

  const blurTranscript = mode === 'dictation' || mode === 'cloze'

  return (
    <div className="mx-auto max-w-[1800px]">
      <nav className="mb-4 text-sm text-muted">
        <button onClick={() => navigate('/app/listening/mine')} className="text-primary hover:underline">
          Video của tôi
        </button>
        {' / '}
        {item?.title ?? '...'}
      </nav>

      {loading && <p className="text-muted">Đang tải...</p>}

      {!loading && item && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 lg:w-2/5">
            <YouTubePlayer ref={playerRef} videoId={item.youtubeVideoId} onTimeUpdate={setCurrentTime} />

            {item.sentences.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Video này chưa có phụ đề.</p>
            ) : (
              <ul
                ref={listContainerRef}
                className="mt-4 max-h-[32rem] space-y-2 overflow-y-auto rounded-md border border-hairline bg-white p-3"
              >
                {item.sentences.map((sentence, i) => {
                  const isActive = i === practiceIndex
                  const isCompleted = completedIndexes.has(i)
                  const isBlurred = blurTranscript

                  return (
                    <li
                      key={sentence.id}
                      ref={(el) => {
                        sentenceRefs.current[sentence.id] = el
                      }}
                    >
                      <button
                        onClick={() => handleSentenceClick(i, sentence.startSeconds)}
                        className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                          isActive
                            ? 'border-2 border-primary bg-primary/5 shadow-sm'
                            : 'border border-transparent hover:bg-surface'
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                            isActive ? 'border-primary bg-primary text-canvas' : 'border-hairline text-muted'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          {isActive && (
                            <span className="mb-1 inline-block rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-canvas">
                              Đang học
                            </span>
                          )}
                          <p
                            className={`text-sm ${isActive ? 'font-medium text-ink' : 'text-ink'} ${
                              isBlurred ? 'select-none blur-[4px]' : ''
                            }`}
                          >
                            {sentence.text}
                          </p>
                          {sentence.translation && (
                            <p
                              className={`mt-0.5 text-xs text-muted ${isBlurred ? 'select-none blur-[4px]' : ''}`}
                            >
                              {sentence.translation}
                            </p>
                          )}
                        </div>
                        {isCompleted && !isActive && <span className="mt-0.5 shrink-0 text-success">✓</span>}
                        {isActive && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              playerRef.current?.seekTo(sentence.startSeconds)
                              playerRef.current?.play()
                            }}
                            className="mt-0.5 shrink-0 cursor-pointer text-muted hover:text-primary"
                            title="Nghe lại câu này"
                          >
                            🔊
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {item.sentences.length > 0 && (
            <div className="min-w-0 lg:w-3/5">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('shadowing')}
                  className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                    mode === 'shadowing' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
                  }`}
                >
                  Shadowing
                </button>
                <button
                  onClick={() => setMode('dictation')}
                  className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                    mode === 'dictation' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
                  }`}
                >
                  Chép chính tả
                </button>
                <button
                  onClick={() => setMode('cloze')}
                  className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                    mode === 'cloze' ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
                  }`}
                >
                  Điền từ
                </button>
              </div>

              {mode === 'shadowing' && (
                <ShadowingPanel
                  sentences={item.sentences}
                  playerRef={playerRef}
                  currentTime={currentTime}
                  index={practiceIndex}
                  onIndexChange={setPracticeIndex}
                  onSentenceComplete={handleSentenceComplete}
                  fetchShadowingFeedback={getMyShadowingFeedback}
                  fetchWordTranslation={getMyWordTranslation}
                />
              )}

              {mode === 'dictation' && (
                <ListeningDictationPanel
                  sentences={item.sentences}
                  playerRef={playerRef}
                  currentTime={currentTime}
                  index={practiceIndex}
                  onIndexChange={setPracticeIndex}
                  onSentenceComplete={handleSentenceComplete}
                />
              )}

              {mode === 'cloze' && (
                <ListeningClozePanel
                  sentences={item.sentences}
                  playerRef={playerRef}
                  currentTime={currentTime}
                  index={practiceIndex}
                  onIndexChange={setPracticeIndex}
                  onSentenceComplete={handleSentenceComplete}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
