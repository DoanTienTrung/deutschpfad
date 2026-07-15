export type SpeakOptions = {
  rate?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
}

export function speak(text: string, options: SpeakOptions = {}) {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'de-DE'
  utterance.rate = options.rate ?? 1
  utterance.volume = options.volume ?? 1
  if (options.onStart) utterance.onstart = options.onStart
  if (options.onEnd) utterance.onend = options.onEnd
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
