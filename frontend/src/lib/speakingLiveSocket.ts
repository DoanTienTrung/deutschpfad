export type LiveCallEventType = 'user_speaking' | 'agent_speaking' | 'agent_done' | 'error' | 'connect_failed'

export type LiveCallHandle = {
  sendAudio: (chunk: ArrayBuffer) => void
  close: () => void
}

/**
 * Opens the browser↔backend WebSocket for a live Sprechen call. Same-origin (nginx proxies
 * /ws/ to the backend), so the cookie-based JWT is sent automatically — no manual auth needed.
 */
export function connectSpeakingLive(
  promptId: number,
  onAudio: (audio: ArrayBuffer) => void,
  onEvent: (event: LiveCallEventType) => void,
  onClose: () => void
): LiveCallHandle {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${protocol}://${window.location.host}/ws/speaking-live?promptId=${promptId}`)
  ws.binaryType = 'arraybuffer'

  ws.onmessage = (event) => {
    if (event.data instanceof ArrayBuffer) {
      onAudio(event.data)
      return
    }
    try {
      const parsed = JSON.parse(event.data as string) as { type: LiveCallEventType }
      onEvent(parsed.type)
    } catch {
      // ignore malformed control messages
    }
  }
  ws.onclose = () => onClose()

  return {
    sendAudio: (chunk) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(chunk)
    },
    close: () => ws.close(),
  }
}
