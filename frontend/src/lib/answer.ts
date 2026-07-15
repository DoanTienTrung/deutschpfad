export function normalizeAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function isCorrectAnswer(input: string, correct: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(correct)
}
