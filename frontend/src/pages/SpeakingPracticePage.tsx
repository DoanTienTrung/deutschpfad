import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Mic, Square } from 'lucide-react'
import { Button } from '@kit'
import { getSpeakingHistory, getSpeakingPrompt, getTurnAudioUrl } from '../api/speakingApi'
import type { RecordingHistory, SpeakingPrompt } from '../api/types'
import { startMicStreamer, type MicStreamerHandle } from '../lib/micStreamer'
import { connectSpeakingLive, type LiveCallHandle } from '../lib/speakingLiveSocket'
import { AgentAudioPlayer } from '../lib/agentAudioPlayer'
import { parseFeedback } from '../lib/parseFeedback'

type CallState = 'idle' | 'connecting' | 'in_call' | 'processing' | 'ended'
type LiveStatus = 'listening' | 'agent_speaking' | 'user_speaking'

const AGENT_SAMPLE_RATE = 24000
const HISTORY_POLL_INTERVAL_MS = 1500
const HISTORY_POLL_MAX_TRIES = 12

function FeedbackCriteria({ feedback }: { feedback: string }) {
  const criteria = parseFeedback(feedback)
  if (criteria.length === 0) return <p className="text-sm text-bleistift">{feedback}</p>

  return (
    <div className="space-y-2">
      {criteria.map((c, i) => (
        <div key={i} className="rounded-karte border border-kartenrand bg-karteikarte p-2">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium text-radiert">{c.title}</span>
            {c.label && (
              <span
                className={`rounded-rund px-2 py-0.5 text-xs font-semibold ${
                  c.label === 'Tốt'
                    ? 'bg-aufstieg-soft text-aufstieg'
                    : c.label === 'Khá'
                      ? 'bg-tinte-soft text-bleistift'
                      : 'bg-rotstift-soft text-rotstift'
                }`}
              >
                {c.label}
              </span>
            )}
          </div>
          <p className="text-sm text-bleistift">{c.text}</p>
        </div>
      ))}
    </div>
  )
}

export default function SpeakingPracticePage() {
  const { promptId } = useParams<{ promptId: string }>()
  const navigate = useNavigate()
  const id = Number(promptId)

  const [prompt, setPrompt] = useState<SpeakingPrompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<RecordingHistory[]>([])

  const [callState, setCallState] = useState<CallState>('idle')
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('listening')
  const [callError, setCallError] = useState<string | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)

  const micRef = useRef<MicStreamerHandle | null>(null)
  const socketRef = useRef<LiveCallHandle | null>(null)
  const playbackRef = useRef<AgentAudioPlayer | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đổi bài thì hiện trạng thái đang tải trước khi gọi lại
    setLoading(true)
    getSpeakingPrompt(id)
      .then(setPrompt)
      .finally(() => setLoading(false))
    getSpeakingHistory(id).then(setHistory)
  }, [id])

  useEffect(() => {
    return () => {
      micRef.current?.stop()
      socketRef.current?.close()
      playbackRef.current?.close()
    }
  }, [])

  async function startCall() {
    setCallError(null)
    setShowTranscript(false)
    setCallState('connecting')

    // A previous attempt (failed mid-setup, or left dangling by a retry) may still hold an open
    // mic stream / WebSocket / AudioContext — clean those up first so we never end up with two
    // sessions playing/streaming audio at once (which sounds like garbled/overlapping audio).
    micRef.current?.stop()
    micRef.current = null
    socketRef.current?.close()
    socketRef.current = null
    playbackRef.current?.close()
    playbackRef.current = null

    try {
      playbackRef.current = new AgentAudioPlayer(AGENT_SAMPLE_RATE)

      const socket = connectSpeakingLive(
        id,
        (audio) => playbackRef.current?.enqueue(audio),
        (event) => {
          if (event === 'agent_speaking') setLiveStatus('agent_speaking')
          else if (event === 'user_speaking') setLiveStatus('user_speaking')
          else if (event === 'agent_done') {
            setLiveStatus('listening')
            playbackRef.current?.play()
          } else if (event === 'connect_failed' || event === 'error') {
            setCallError('Không kết nối được với AI lúc này, thử lại sau nhé.')
          }
        },
        () => {
          // Backend closed the socket (or network dropped) — treat as call end.
          endCallCleanup()
        }
      )
      socketRef.current = socket

      const mic = await startMicStreamer((chunk) => socket.sendAudio(chunk))
      micRef.current = mic

      setCallState('in_call')
    } catch {
      micRef.current?.stop()
      micRef.current = null
      socketRef.current?.close()
      socketRef.current = null
      playbackRef.current?.close()
      playbackRef.current = null
      setCallError('Không truy cập được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.')
      setCallState('idle')
    }
  }

  function endCallCleanup() {
    micRef.current?.stop()
    micRef.current = null
    playbackRef.current?.close()
    playbackRef.current = null
  }

  async function endCall() {
    const historyCountBefore = history.length
    endCallCleanup()
    socketRef.current?.close()
    socketRef.current = null
    setCallState('processing')

    for (let i = 0; i < HISTORY_POLL_MAX_TRIES; i++) {
      await new Promise((resolve) => setTimeout(resolve, HISTORY_POLL_INTERVAL_MS))
      const latest = await getSpeakingHistory(id)
      if (latest.length > historyCountBefore) {
        setHistory(latest)
        setCallState('ended')
        return
      }
    }
    // Timed out with no new recording — most likely the call never actually connected/spoke
    // (e.g. AI connection failed), so there's nothing to show. Go back to idle with an error
    // instead of leaving the UI blank.
    setCallError('Cuộc gọi không ghi nhận được nội dung nào - có thể AI không kết nối được. Thử gọi lại nhé.')
    setCallState('idle')
  }

  if (loading)
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-28 animate-pulse rounded-karte bg-karteikarte-innen" />
        <div className="h-40 animate-pulse rounded-karte bg-karteikarte-innen" />
      </div>
    )
  if (!prompt) return null

  const latestRecording = history[0]

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-4 text-sm text-radiert">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Nói
        </Button>
      </nav>

      <div className="rounded-karte border border-kartenrand bg-karteikarte p-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-radiert">[{prompt.level}]</p>
        <p className="mb-2 text-lg font-medium text-bleistift">{prompt.promptText}</p>
        {prompt.description && <p className="mb-4 text-sm text-radiert">{prompt.description}</p>}

        {callState === 'idle' && (
          <Button variant="primary"
            onClick={startCall}>
            Bắt đầu cuộc gọi với AI
          </Button>
        )}

        {callState === 'connecting' && <p className="text-sm text-radiert">Đang kết nối...</p>}

        {callState === 'in_call' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-rund text-3xl ${
                liveStatus === 'agent_speaking'
                  ? 'animate-pulse bg-tinte-soft'
                  : liveStatus === 'user_speaking'
                    ? 'bg-bleistift/20'
                    : 'bg-karteikarte-innen'
              }`}
            >
              <Mic className="size-7" aria-hidden="true" />
            </div>
            <p className="text-sm text-radiert">
              {liveStatus === 'agent_speaking'
                ? 'AI đang nói...'
                : liveStatus === 'user_speaking'
                  ? 'Đang nghe bạn...'
                  : 'Đang trong cuộc gọi'}
            </p>
            <Button variant="danger" icon={<Square className="size-4" aria-hidden="true" />}
              onClick={endCall}>
              Kết thúc cuộc gọi
            </Button>
          </div>
        )}

        {callState === 'processing' && (
          <p className="py-6 text-center text-sm text-radiert">Đang xử lý kết quả...</p>
        )}

        {callError && <p className="mt-3 text-sm text-rotstift">{callError}</p>}

        {callState === 'ended' && latestRecording && (
          <div className="mt-4 rounded-karte border border-linie bg-karteikarte-innen p-3">
            <p className="mb-2 text-sm font-medium text-bleistift">Nhận xét từ AI</p>
            {latestRecording.feedback ? (
              <FeedbackCriteria feedback={latestRecording.feedback} />
            ) : (
              <p className="text-sm text-bleistift">Chưa chấm được lúc này.</p>
            )}
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm"
                onClick={() => setShowTranscript((v) => !v)}>
                {showTranscript ? 'Ẩn hội thoại' : 'Xem lại hội thoại'}
              </Button>
              <Button variant="secondary" size="sm"
                onClick={startCall}>
                Gọi lại
              </Button>
            </div>

            {showTranscript && (
              <ul className="mt-3 space-y-2">
                {latestRecording.turns.map((turn) => (
                  <li
                    key={turn.id}
                    className={`rounded-karte p-2 text-sm ${
                      turn.role === 'AGENT' ? 'border border-linie bg-karteikarte text-bleistift' : 'ml-6 bg-tinte-soft text-bleistift'
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium text-radiert">
                      {turn.role === 'AGENT' ? 'AI' : 'Bạn'}
                    </p>
                    <p>{turn.text}</p>
                    <audio controls src={getTurnAudioUrl(turn.id)} className="mt-1 h-8 w-full">
                      Trình duyệt không hỗ trợ phát audio.
                    </audio>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-bleistift">Lịch sử các cuộc gọi ({history.length})</p>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="rounded-karte border border-kartenrand bg-karteikarte p-3 text-sm">
                {h.feedback && <FeedbackCriteria feedback={h.feedback} />}
                <p className="mt-2 text-xs text-radiert">{new Date(h.createdAt).toLocaleString('vi-VN')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
