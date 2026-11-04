import { useEffect, useState } from 'react'
import { Pause, Play, Settings2, Volume2 } from 'lucide-react'
import { DropdownMenu, IconButton, Slider } from '@kit'
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
    <div className="flex items-center gap-2">
      <IconButton label={isPlaying ? 'Đang phát' : 'Phát lại'} variant="secondary" onClick={play}
        icon={isPlaying ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />} />

      <div className="h-1 flex-1 overflow-hidden rounded-rund bg-linie">
        <div className="h-full bg-bleistift transition-[width] duration-100 ease-linear" style={{ width: `${(elapsed / duration) * 100}%` }} />
      </div>

      <span className="text-xs tabular-nums text-radiert">{formatTime(elapsed)}</span>

      <Volume2 className="size-4 shrink-0 text-radiert" aria-hidden="true" />
      <Slider min={0} max={1} step={0.1} value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Âm lượng" className="w-16" />

      <DropdownMenu label={`Tốc độ đọc: ${rate}x`} trigger={<Settings2 className="size-4" aria-hidden="true" />}
        items={RATES.map((r) => ({ label: `${r}x${rate === r ? ' (đang dùng)' : ''}`, onSelect: () => setRate(r) }))} />
    </div>
  )
}
