/** Một từ trong câu đã sửa, đánh dấu có giống câu người học viết hay không. */
export type DiffWord = { text: string; changed: boolean }

const strip = (w: string) => w.replace(/[.,!?;:"„“”]/g, '')

/**
 * So từng từ giữa câu người học viết và câu đã sửa (dãy con chung dài nhất), trả về các từ của câu đã sửa
 * kèm cờ "đã đổi" để tô màu. So không tính dấu câu dính vào từ nhưng tính hoa thường (tiếng Đức viết hoa
 * danh từ là lỗi thật).
 */
export function diffWords(answer: string, corrected: string): DiffWord[] {
  const a = answer.trim().split(/\s+/).filter(Boolean)
  const c = corrected.trim().split(/\s+/).filter(Boolean)
  const n = a.length
  const m = c.length
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = strip(a[i]) === strip(c[j]) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }
  const result: DiffWord[] = []
  let i = 0
  let j = 0
  while (j < m) {
    if (i < n && strip(a[i]) === strip(c[j])) {
      result.push({ text: c[j], changed: false })
      i++
      j++
    } else if (i < n && lcs[i + 1][j] >= lcs[i][j + 1]) {
      i++
    } else {
      result.push({ text: c[j], changed: true })
      j++
    }
  }
  return result
}

/** Gợi ý chữ cái đầu: "Gestern habe ich Reis gekocht." → "G______ h___ i__ R___ g______." */
export function firstLetterHint(sentence: string): string {
  return sentence
    .trim()
    .split(/\s+/)
    .map((word) => {
      const match = word.match(/^([^\p{L}]*)(\p{L})(\p{L}*)(.*)$/u)
      if (!match) return word
      const [, pre, first, rest, post] = match
      return `${pre}${first}${'_'.repeat(rest.length)}${post}`
    })
    .join(' ')
}

/** Các từ của câu tham khảo cho kiểu "Xếp từ" (bỏ dấu câu cuối câu), xáo trộn cố định theo id câu. */
export function wordBankTokens(sentence: string, seed: number): string[] {
  const words = sentence.trim().replace(/[.!?…]+$/, '').split(/\s+/).filter(Boolean)
  const tokens = words.map((w, i) => ({ w, key: (Math.imul(seed + 1, 2654435761) ^ Math.imul(i + 1, 40503)) >>> 0 }))
  const shuffled = [...tokens].sort((x, y) => x.key - y.key).map((t) => t.w)
  // Hiếm khi xáo ra đúng thứ tự gốc: đảo hai từ đầu để bài không tự giải sẵn.
  if (shuffled.length > 1 && shuffled.every((w, i) => w === words[i])) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }
  return shuffled
}
