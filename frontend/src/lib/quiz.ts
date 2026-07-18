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

function stripArticle(word: string): string {
  return word.replace(/^(der|die|das)\s+/i, '').trim()
}

export type QuestionDisplay = {
  /** Sentence text to render as-is (may already have "_____" embedded when blanked). */
  text: string
  /** When set, this exact substring appears in `text` and should be underlined, not blanked. */
  highlightWord: string | null
}

/**
 * German conjugates/declines (gelten -> gilt), so a literal substring match against the
 * dictionary form often fails. `exampleSentenceHighlight` (backfilled by an AI audit — see
 * VocabularyItemAdminController.startAudit) stores the exact form that appears in the sentence.
 * When it matches the dictionary form exactly, blank it out like a normal cloze question; when
 * it's an inflected form, underline it instead of hiding it, so the reader can see what word the
 * answer choices are meant to replace.
 */
export function questionDisplay(item: {
  exampleSentence: string | null
  exampleSentenceHighlight: string | null
  germanWord: string
}): QuestionDisplay | null {
  if (!item.exampleSentence) return null
  const sentence = item.exampleSentence

  if (!item.exampleSentenceHighlight) {
    if (sentence.toLowerCase().includes(item.germanWord.toLowerCase())) {
      return { text: blankOut(sentence, item.germanWord), highlightWord: null }
    }
    return { text: sentence, highlightWord: null }
  }

  const isDictionaryForm =
    item.exampleSentenceHighlight.toLowerCase() === stripArticle(item.germanWord).toLowerCase()
  if (isDictionaryForm) {
    return { text: blankOut(sentence, item.exampleSentenceHighlight), highlightWord: null }
  }
  return { text: sentence, highlightWord: item.exampleSentenceHighlight }
}
