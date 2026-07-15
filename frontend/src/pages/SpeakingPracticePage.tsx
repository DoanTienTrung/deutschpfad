import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  if (criteria.length === 0) return <p className="text-sm text-ink">{feedback}</p>

  return (
    <div className="space-y-2">
      {criteria.map((c, i) => (
        <div key={i} className="rounded-md border border-hairline bg-white p-2">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium text-muted">{c.title}</span>
            {c.label && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  c.label === 'Tốt'
                    ? 'bg-success-bg text-success'
                    : c.label === 'Khá'
                      ? 'bg-accent/30 text-ink'
                      : 'bg-danger-bg text-danger'
                }`}
              >
                {c.label}
              </span>
            )}
          </div>
          <p className="text-sm text-ink">{c.text}</p>
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
    setCallError('Cuộc gọi không ghi nhận được nội dung nào — có thể AI không kết nối được. Thử gọi lại nhé.')
    setCallState('idle')
  }

  if (loading) return <p className="text-muted">Đang tải...</p>
  if (!prompt) return null

  const latestRecording = history[0]

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-4 text-sm text-muted">
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">
          Nói
        </button>
      </nav>

      <div className="rounded-md border border-hairline bg-white p-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">[{prompt.level}]</p>
        <p className="mb-2 text-lg font-medium text-ink">{prompt.promptText}</p>
        {prompt.description && <p className="mb-4 text-sm text-muted">{prompt.description}</p>}

        {callState === 'idle' && (
          <button
            onClick={startCall}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-canvas hover:bg-primary-deep"
          >
            📞 Bắt đầu cuộc gọi với AI
          </button>
        )}

        {callState === 'connecting' && <p className="text-sm text-muted">Đang kết nối...</p>}

        {callState === 'in_call' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl ${
                liveStatus === 'agent_speaking'
                  ? 'animate-pulse bg-accent/40'
                  : liveStatus === 'user_speaking'
                    ? 'bg-primary/20'
                    : 'bg-surface'
              }`}
            >
              🎙️
            </div>
            <p className="text-sm text-muted">
              {liveStatus === 'agent_speaking'
                ? 'AI đang nói...'
                : liveStatus === 'user_speaking'
                  ? 'Đang nghe bạn...'
                  : 'Đang trong cuộc gọi'}
            </p>
            <button
              onClick={endCall}
              className="rounded-full bg-danger px-6 py-3 text-sm font-medium text-canvas"
            >
              ⏹ Kết thúc cuộc gọi
            </button>
          </div>
        )}

        {callState === 'processing' && (
          <p className="py-6 text-center text-sm text-muted">Đang xử lý kết quả...</p>
        )}

        {callError && <p className="mt-3 text-sm text-danger">{callError}</p>}

        {callState === 'ended' && latestRecording && (
          <div className="mt-4 rounded-md border border-hairline bg-surface p-3">
            <p className="mb-2 text-sm font-medium text-ink">Nhận xét từ AI</p>
            {latestRecording.feedback ? (
              <FeedbackCriteria feedback={latestRecording.feedback} />
            ) : (
              <p className="text-sm text-ink">Chưa chấm được lúc này.</p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowTranscript((v) => !v)}
                className="rounded-sm border border-hairline bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
              >
                {showTranscript ? 'Ẩn hội thoại' : '💬 Xem lại hội thoại'}
              </button>
              <button
                onClick={startCall}
                className="rounded-sm border border-hairline bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
              >
                📞 Gọi lại
              </button>
            </div>

            {showTranscript && (
              <ul className="mt-3 space-y-2">
                {latestRecording.turns.map((turn) => (
                  <li
                    key={turn.id}
                    className={`rounded-md p-2 text-sm ${
                      turn.role === 'AGENT' ? 'bg-white text-ink' : 'ml-6 bg-accent/20 text-ink'
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium text-muted">
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
          <p className="mb-2 text-sm font-medium text-ink">Lịch sử các cuộc gọi ({history.length})</p>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="rounded-md border border-hairline bg-white p-3 text-sm">
                {h.feedback && <FeedbackCriteria feedback={h.feedback} />}
                <p className="mt-2 text-xs text-muted">{new Date(h.createdAt).toLocaleString('vi-VN')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
