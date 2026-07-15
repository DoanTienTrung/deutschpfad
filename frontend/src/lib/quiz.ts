export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildChoices(correct: string, pool: string[], count = 4): string[] {
  const distractors = shuffle(pool.filter((value) => value !== correct)).slice(0, count - 1)
  return shuffle([correct, ...distractors])
}

export function blankOut(sentence: string, word: string): string {
  const idx = sentence.toLowerCase().indexOf(word.toLowerCase())
  if (idx === -1) return sentence
  return `${sentence.slice(0, idx)}_____${sentence.slice(idx + word.length)}`
}

export function questionText(item: { exampleSentence: string | null; germanWord: string }): string | null {
  if (!item.exampleSentence) return null
  if (item.exampleSentence.toLowerCase().includes(item.germanWord.toLowerCase())) {
    return blankOut(item.exampleSentence, item.germanWord)
  }
  return item.exampleSentence
}
