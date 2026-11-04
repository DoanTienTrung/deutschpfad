import { useEffect, useRef, useState, type RefObject } from 'react'
import { ArrowLeft, Mic, Play, Repeat, Sparkles, Square } from 'lucide-react'
import { Button } from '@kit'
import type { ListeningSentence, ShadowingFeedback, WordTranslation } from '../../api/types'
import type { YouTubePlayerRef } from './YouTubePlayer'

type RecordingState = 'idle' | 'recording' | 'recorded'
type GradingState = 'idle' | 'loading' | 'error'

function tokenize(text: string): string[] {
  return text.match(/[A-Za-zäöüßÄÖÜ]+|[^A-Za-zäöüßÄÖÜ]+/g) ?? []
}

function isWordToken(token: string) {
  return /^[A-Za-zäöüßÄÖÜ]+$/.test(token)
}

export default function ShadowingPanel({
  sentences,
  playerRef,
  currentTime,
  index,
  onIndexChange,
  onSentenceComplete,
  fetchShadowingFeedback,
  fetchWordTranslation,
}: {
  sentences: ListeningSentence[]
  playerRef: RefObject<YouTubePlayerRef | null>
  currentTime: number
  index: number
  onIndexChange: (index: number) => void
  onSentenceComplete: (index: number) => void
  fetchShadowingFeedback: (sentenceId: number, audio: Blob) => Promise<ShadowingFeedback>
  fetchWordTranslation: (sentenceId: number, word: string) => Promise<WordTranslation>
}) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const [gradingState, setGradingState] = useState<GradingState>('idle')
  const [feedback, setFeedback] = useState<ShadowingFeedback | null>(null)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [wordTranslation, setWordTranslation] = useState<string | null>(null)
  const [wordLoading, setWordLoading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordedUrlRef = useRef<string | null>(null)
  const recordedBlobRef = useRef<Blob | null>(null)
  const wordCacheRef = useRef<Map<string, string | null>>(new Map())

  const sentence = sentences[index]

  useEffect(() => {
    recordedUrlRef.current = recordedUrl
  }, [recordedUrl])

  useEffect(() => {
    if (!sentence) return
    playerRef.current?.seekTo(sentence.startSeconds)
    playerRef.current?.play()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đổi câu thì bỏ bản ghi âm cũ
    setRecordingState('idle')
    setMicError(null)
    setGradingState('idle')
    setFeedback(null)
    setSelectedWord(null)
    setWordTranslation(null)
    wordCacheRef.current = new Map()
    recordedBlobRef.current = null
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current)
      recordedUrlRef.current = null
    }
    setRecordedUrl(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when moving to a different sentence
  }, [index])

  useEffect(() => {
    return () => {
      if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
    }
  }, [])

  useEffect(() => {
    if (!sentence) return
    // The last sentence's endSeconds is a synthetic "+5s" placeholder (no next sentence to derive
    // a real boundary from), often shorter than the actual clip — don't cut playback short there;
    // let it run to the audio's real end instead of auto-pausing mid-sentence.
    const isLastSentence = index === sentences.length - 1
    if (!isLastSentence && currentTime >= sentence.endSeconds) playerRef.current?.pause()
  }, [currentTime, sentence, playerRef, index, sentences.length])

  function playOriginal() {
    if (!sentence) return
    playerRef.current?.seekTo(sentence.startSeconds)
    playerRef.current?.play()
  }

  async function handleWordClick(word: string) {
    if (!sentence) return
    setSelectedWord(word)

    const cached = wordCacheRef.current.get(word.toLowerCase())
    if (cached !== undefined) {
      setWordTranslation(cached)
      return
    }

    setWordLoading(true)
    setWordTranslation(null)
    try {
      const result = await fetchWordTranslation(sentence.id, word)
      wordCacheRef.current.set(word.toLowerCase(), result.translation)
      setWordTranslation(result.translation)
    } catch {
      setWordTranslation(null)
    } finally {
      setWordLoading(false)
    }
  }

  async function startRecording() {
    setMicError(null)
    setFeedback(null)
    setGradingState('idle')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        recordedBlobRef.current = blob
        setRecordedUrl(URL.createObjectURL(blob))
        setRecordingState('recorded')
        stream.getTracks().forEach((track) => track.stop())
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setRecordingState('recording')
    } catch {
      setMicError('Không truy cập được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
  }

  async function handleGradePronunciation() {
    if (!recordedBlobRef.current || !sentence) return
    setGradingState('loading')
    setFeedback(null)
    try {
      const result = await fetchShadowingFeedback(sentence.id, recordedBlobRef.current)
      setFeedback(result)
      setGradingState(result.available ? 'idle' : 'error')
      // Only counts as "completed" once the learner has actually seen a pronunciation result —
      // recording alone (without checking the grade) previously counted, which was too lenient.
      if (result.available) onSentenceComplete(index)
    } catch {
      setGradingState('error')
    }
  }

  function goTo(newIndex: number) {
    if (newIndex < 0 || newIndex >= sentences.length) return
    onIndexChange(newIndex)
  }

  if (!sentence) return null

  const tokens = tokenize(sentence.text)

  return (
    <div className="mt-4 rounded-karte border border-kartenrand bg-karteikarte p-4">
      <p className="mb-3 text-sm text-radiert">
        Câu {index + 1}/{sentences.length}
      </p>

      <p className="mb-1 text-xs text-radiert">Bấm vào 1 từ để xem nghĩa riêng</p>
      <p className="mb-1 text-base font-medium text-bleistift">
        {tokens.map((token, i) =>
          isWordToken(token) ? (
            <span
              key={i}
              onClick={() => handleWordClick(token)}
              className={`cursor-pointer rounded-karte px-0.5 hover:bg-reiter/30 ${
                selectedWord === token ? 'bg-tinte-soft' : ''
              }`}
            >
              {token}
            </span>
          ) : (
            <span key={i}>{token}</span>
          )
        )}
      </p>

      {sentence.phonetic && <p className="mb-3 text-sm italic text-radiert">/{sentence.phonetic.replace(/^\/|\/$/g, '')}/</p>}

      {selectedWord && (
        <p className="mb-3 text-sm text-bleistift">
          <span className="font-medium">{selectedWord}</span>
          {wordLoading ? ' - đang tra...' : wordTranslation ? ` - ${wordTranslation}` : ' - chưa tra được nghĩa'}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" icon={<Play className="size-4" aria-hidden="true" />}
          onClick={playOriginal}>
          Nghe câu gốc
        </Button>

        {recordingState !== 'recording' ? (
          <Button variant="primary" icon={<Mic className="size-4" aria-hidden="true" />}
            onClick={startRecording}>
            Ghi âm
          </Button>
        ) : (
          <Button variant="danger" icon={<Square className="size-4" aria-hidden="true" />}
            onClick={stopRecording}>
            Dừng ghi âm
          </Button>
        )}

        {recordedUrl && (
          <audio controls src={recordedUrl} className="h-9">
            Trình duyệt không hỗ trợ phát audio.
          </audio>
        )}

        {recordingState === 'recorded' && (
          <Button variant="secondary" icon={<Sparkles className="size-4" aria-hidden="true" />}
            onClick={handleGradePronunciation}
            disabled={gradingState === 'loading'}>
            {gradingState === 'loading' ? 'Đang chấm...' : 'Chấm phát âm bằng AI'}
          </Button>
        )}
      </div>

      {micError && <p className="mt-3 text-sm text-rotstift">{micError}</p>}
      {recordingState === 'recording' && (
        <p className="mt-3 flex items-center gap-2 text-sm text-rotstift">
          <span className="size-2.5 animate-pulse rounded-rund bg-rotstift" aria-hidden="true" />
          Đang ghi âm... bấm "Dừng ghi âm" khi xong.
        </p>
      )}

      {gradingState === 'error' && (
        <p className="mt-3 text-sm text-radiert">
          Chưa chấm được lúc này (dịch vụ AI đang bận hoặc chưa cấu hình) - bạn vẫn có thể tự nghe
          lại và so sánh bằng tai như bình thường.
        </p>
      )}

      {feedback && feedback.available && (
        <div className="mt-4 rounded-karte border border-linie bg-karteikarte-innen p-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-bleistift">Kết quả chấm phát âm</span>
            <span
              className={`rounded-rund px-2 py-0.5 text-xs font-semibold ${
                feedback.scorePercent >= 80
                  ? 'bg-aufstieg-soft text-aufstieg'
                  : feedback.scorePercent >= 50
                    ? 'bg-tinte-soft text-bleistift'
                    : 'bg-rotstift-soft text-rotstift'
              }`}
            >
              {feedback.scorePercent}%
            </span>
          </div>
          <p className="flex flex-wrap gap-x-1.5 gap-y-1 text-base">
            {feedback.words.map((w, i) => (
              <span key={i} className={w.correct ? 'text-aufstieg' : 'font-medium text-rotstift underline decoration-wavy'}>
                {w.word}
              </span>
            ))}
          </p>
          <p className="mt-2 text-xs text-radiert">AI nghe được: "{feedback.transcript}"</p>
          <Button variant="secondary" icon={<Repeat className="size-4" aria-hidden="true" />} className="mt-3"
            onClick={startRecording}>
            Ghi âm lại
          </Button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-linie pt-4">
        <Button variant="secondary" size="sm" icon={<ArrowLeft className="size-4" aria-hidden="true" />} className="disabled:opacity-40"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}>
          Câu trước
        </Button>
        <Button variant="secondary" size="sm" className="disabled:opacity-40"
          onClick={() => goTo(index + 1)}
          disabled={index === sentences.length - 1}>
          Câu tiếp theo</Button>
      </div>
    </div>
  )
}
