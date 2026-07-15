const TARGET_SAMPLE_RATE = 16000

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    // `sampleRate` is a global provided by AudioWorkletGlobalScope — the AudioContext's actual
    // negotiated rate, which browsers don't always honor as requested (e.g. may stay at 48kHz
    // even if 16000 was requested). Resample here so what we send always matches what the
    // backend/Deepgram was told to expect, regardless of what the browser actually gave us.
    this.ratio = sampleRate / TARGET_SAMPLE_RATE
  }

  process(inputs) {
    const input = inputs[0]
    if (input && input[0] && input[0].length > 0) {
      const channelData = input[0]
      const outputLength = Math.max(1, Math.floor(channelData.length / this.ratio))
      const pcm16 = new Int16Array(outputLength)

      for (let i = 0; i < outputLength; i++) {
        const srcIndex = i * this.ratio
        const srcIndexFloor = Math.floor(srcIndex)
        const srcIndexCeil = Math.min(srcIndexFloor + 1, channelData.length - 1)
        const frac = srcIndex - srcIndexFloor
        const sample = channelData[srcIndexFloor] * (1 - frac) + channelData[srcIndexCeil] * frac
        const s = Math.max(-1, Math.min(1, sample))
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }

      this.port.postMessage(pcm16.buffer, [pcm16.buffer])
    }
    return true
  }
}

registerProcessor('pcm-processor', PCMProcessor)
