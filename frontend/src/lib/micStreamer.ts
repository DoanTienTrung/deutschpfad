export type MicStreamerHandle = {
  stop: () => void
}

/**
 * Captures mic audio as raw PCM16 mono @ 16kHz via an AudioWorklet (see public/pcm-processor.js)
 * and invokes onChunk with each buffer as it's produced — used to stream audio to the backend in
 * near real-time instead of the big-blob MediaRecorder approach used by Shadowing/old Speaking.
 */
export async function startMicStreamer(onChunk: (pcm16: ArrayBuffer) => void): Promise<MicStreamerHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
  })

  const audioContext = new AudioContext({ sampleRate: 16000 })
  await audioContext.audioWorklet.addModule('/pcm-processor.js')

  const source = audioContext.createMediaStreamSource(stream)
  const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor')
  workletNode.port.onmessage = (event) => onChunk(event.data as ArrayBuffer)
  source.connect(workletNode)

  return {
    stop: () => {
      workletNode.port.onmessage = null
      source.disconnect()
      workletNode.disconnect()
      stream.getTracks().forEach((track) => track.stop())
      audioContext.close().catch(() => {})
    },
  }
}
