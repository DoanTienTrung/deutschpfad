import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { YouTubePlayerRef } from './YouTubePlayer'

// Same imperative ref shape as YouTubePlayer (seekTo/pause/play) so practice pages can point a
// single ref at whichever player is actually rendered for a given exercise.
const AudioPlayer = forwardRef<YouTubePlayerRef, { src: string; onTimeUpdate?: (seconds: number) => void }>(
  function AudioPlayer({ src, onTimeUpdate }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null)

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (audioRef.current) audioRef.current.currentTime = seconds
      },
      pause: () => audioRef.current?.pause(),
      play: () => {
        audioRef.current?.play().catch(() => {})
      },
    }))

    return (
      <audio
        ref={audioRef}
        src={src}
        controls
        onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
        className="w-full rounded-md bg-surface"
      />
    )
  }
)

export default AudioPlayer
