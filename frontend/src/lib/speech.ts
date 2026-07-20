export type SpeakOptions = {
  rate?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
}

// Held at module scope: some browsers garbage-collect an unreferenced utterance mid-playback,
// which cuts the audio off silently (a long-standing Web Speech API bug).
let currentUtterance: SpeechSynthesisUtterance | null = null

function pickGermanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang.toLowerCase() === 'de-de') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('de')) ??
    null
  )
}

// On mobile browsers getVoices() returns [] until the list loads asynchronously; requesting it
// once at module load (and again on voiceschanged) warms it up so the first real speak() can
// already find a German voice instead of silently using a wrong-language default.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    window.speechSynthesis.getVoices()
  })
}

export function speak(text: string, options: SpeakOptions = {}) {
  if (!('speechSynthesis' in window)) return
  const synth = window.speechSynthesis

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    const voice = pickGermanVoice()
    if (voice) utterance.voice = voice
    utterance.rate = options.rate ?? 1
    utterance.volume = options.volume ?? 1
    if (options.onStart) utterance.onstart = options.onStart
    utterance.onend = () => {
      currentUtterance = null
      options.onEnd?.()
    }
    currentUtterance = utterance
    synth.speak(utterance)
  }

  // Android Chrome silently drops an utterance queued in the same tick as cancel() -- only
  // cancel when something is actually playing, and give the engine a beat before re-queueing.
  if (synth.speaking || synth.pending || currentUtterance !== null) {
    synth.cancel()
    setTimeout(doSpeak, 60)
  } else {
    doSpeak()
  }
}
