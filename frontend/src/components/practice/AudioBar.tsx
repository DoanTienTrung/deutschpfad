import { useEffect, useState } from 'react'
import { speak } from '../../lib/speech'

const RATES = [0.75, 1, 1.25]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function AudioBar({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [rate, setRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const duration = Math.max(0.6, text.length * 0.09) / rate

  function play() {
    setPlayCount((c) => c + 1)
    speak(text, {
      rate,
      volume,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
    })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- auto-play audio when the word changes
    play()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-play when the word itself changes
  }, [text])

  useEffect(() => {
    if (!isPlaying) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the visible timer as soon as playback stops
      setElapsed(0)
      return
    }
    const start = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.min(duration, (Date.now() - start) / 1000))
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart the timer whenever playback (re)starts
  }, [isPlaying, playCount])

  return (
    <div className="flex items-center gap-3">
      <button onClick={play} aria-label={isPlaying ? 'Đang phát' : 'Phát lại'} className="text-ink">
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div className="h-1 flex-1 overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full bg-primary transition-[width] duration-100 linear"
          style={{ width: `${(elapsed / duration) * 100}%` }}
        />
      </div>

      <span className="text-xs tabular-nums text-muted">{formatTime(elapsed)}</span>

      <span aria-hidden className="text-ink">🔊</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.1}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-16 accent-primary"
        aria-label="Âm lượng"
      />

      <div className="relative">
        <button
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Tốc độ đọc"
          className="text-ink"
        >
          ⚙
        </button>
        {showSettings && (
          <div className="absolute right-0 top-8 z-10 rounded-md border border-hairline bg-white p-2 shadow-floating">
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRate(r)
                  setShowSettings(false)
                }}
                className={`block w-full rounded-sm px-3 py-1.5 text-left text-sm ${
                  rate === r ? 'bg-primary text-canvas' : 'text-ink hover:bg-surface'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
