// Thin wrapper around the official YouTube IFrame Player API. Loading the script and creating
// a YT.Player gives us programmatic control (getCurrentTime/seekTo/pauseVideo) that a plain
// <iframe src="..."> cannot provide — needed for transcript sync and shadowing pause points.
// The video/audio itself is always streamed directly from YouTube's own player; nothing is
// downloaded or proxied through our servers.

export interface YouTubePlayerHandle {
  getCurrentTime(): number
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
}

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId: string
    playerVars?: Record<string, unknown>
    events?: { onReady?: () => void }
  }
) => YouTubePlayerHandle

declare global {
  interface Window {
    YT?: { Player: YouTubePlayerConstructor }
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiLoadPromise: Promise<void> | null = null

function loadIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (apiLoadPromise) return apiLoadPromise

  apiLoadPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve()
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return apiLoadPromise
}

export async function createYouTubePlayer(element: HTMLElement, videoId: string): Promise<YouTubePlayerHandle> {
  await loadIframeApi()
  return new Promise((resolve) => {
    const player = new window.YT!.Player(element, {
      videoId,
      playerVars: { rel: 0 },
      events: {
        onReady: () => resolve(player),
      },
    })
  })
}
