import { wrapPcm16AsWav } from './wavEncoder'

/**
 * Buffers the AI's PCM16 audio chunks for one utterance and plays the complete clip via a plain
 * <audio> element once the utterance is done (triggered by the "agent_done" event), instead of
 * streaming/scheduling individual chunks in real time. A hand-rolled low-latency AudioWorklet
 * player produced glitchy/garbled audio that couldn't be diagnosed from the client side alone;
 * the raw audio itself was verified clean (re-transcribed correctly by Deepgram STT), so the
 * bug was specifically in the real-time scheduling approach. This trades a bit of latency
 * (waiting for the whole utterance) for the browser's own well-tested WAV decoder/playback,
 * which is the same approach already used for "Nghe lại hội thoại" and known to work.
 */
export class AgentAudioPlayer {
  private chunks: Uint8Array[] = []
  private audioEl = new Audio()
  private sourceSampleRate: number
  private currentUrl: string | null = null

  constructor(sourceSampleRate: number) {
    this.sourceSampleRate = sourceSampleRate
  }

  enqueue(pcm16: ArrayBuffer) {
    this.chunks.push(new Uint8Array(pcm16))
  }

  play() {
    if (this.chunks.length === 0) return
    const totalLength = this.chunks.reduce((sum, c) => sum + c.length, 0)
    const merged = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of this.chunks) {
      merged.set(chunk, offset)
      offset += chunk.length
    }
    this.chunks = []

    if (this.currentUrl) URL.revokeObjectURL(this.currentUrl)
    const blob = wrapPcm16AsWav(merged, this.sourceSampleRate)
    this.currentUrl = URL.createObjectURL(blob)
    this.audioEl.src = this.currentUrl
    this.audioEl.play().catch(() => {})
  }

  close() {
    this.audioEl.pause()
    this.audioEl.src = ''
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl)
      this.currentUrl = null
    }
  }
}
