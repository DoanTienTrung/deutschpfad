import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { createYouTubePlayer, type YouTubePlayerHandle } from '../../lib/youtubePlayer'

export type YouTubePlayerRef = {
  seekTo: (seconds: number) => void
  pause: () => void
  play: () => void
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, { videoId: string; onTimeUpdate?: (seconds: number) => void }>(
  function YouTubePlayer({ videoId, onTimeUpdate }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<YouTubePlayerHandle | null>(null)

    useEffect(() => {
      let cancelled = false
      if (!containerRef.current) return
      createYouTubePlayer(containerRef.current, videoId).then((player) => {
        if (!cancelled) playerRef.current = player
      })
      return () => {
        cancelled = true
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- re-create the player only when the video changes
    }, [videoId])

    useEffect(() => {
      if (!onTimeUpdate) return
      const interval = setInterval(() => {
        if (playerRef.current) onTimeUpdate(playerRef.current.getCurrentTime())
      }, 250)
      return () => clearInterval(interval)
    }, [onTimeUpdate])

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => playerRef.current?.seekTo(seconds, true),
      pause: () => playerRef.current?.pauseVideo(),
      play: () => playerRef.current?.playVideo(),
    }))

    return <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-md bg-ink" />
  }
)

export default YouTubePlayer
