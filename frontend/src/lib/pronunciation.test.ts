import { describe, expect, it } from 'vitest'
import { LETTERS, MINIMAL_PAIRS, SOUNDS, SPELLING_WORDS, spellOut, spellingSpeech } from './pronunciation'

describe('bảng chữ cái', () => {
  it('đủ 26 chữ + Ä Ö Ü ß, chữ nào cũng có ví dụ và cách đánh vần', () => {
    expect(LETTERS).toHaveLength(30)
    for (const l of LETTERS) {
      expect(l.examples.length).toBeGreaterThan(0)
      expect(SPELLING_WORDS[l.lower === 'ß' ? 'ß' : l.upper]).toBeTruthy()
    }
  })

  it('giọng đọc nhận tên chữ đã viết ra, không nhận chữ cái trần dễ bị đọc kiểu tiếng Anh', () => {
    const speakOf = (upper: string) => LETTERS.find((l) => l.upper === upper)!.speak
    expect(speakOf('J')).toBe('Jott')
    expect(speakOf('V')).toBe('Fau')
    expect(speakOf('Y')).toBe('Ypsilon')
  })

  it('âm ghép và cặp dễ nhầm đều có ví dụ khác nhau', () => {
    for (const s of SOUNDS) expect(s.examples.length).toBeGreaterThan(0)
    for (const p of MINIMAL_PAIRS) expect(p.a.word).not.toBe(p.b.word)
  })
})

describe('đánh vần', () => {
  it('tách từng chữ, nhận cả Umlaut và ß, kèm từ đánh vần qua điện thoại', () => {
    const spelled = spellOut('Müßig')
    expect(spelled.map((c) => c.letter?.name)).toEqual(['emm', 'ü', 'eszett', 'i', 'ge'])
    expect(spelled[1].spellingWord).toBe('Übermut')
    expect(spelled[2].spellingWord).toBe('Eszett')
  })

  it('tên tiếng Việt có dấu đánh vần theo chữ gốc, như trên giấy tờ', () => {
    expect(spellingSpeech('Lê Đức')).toBe('Ell, E, De, U, Ze')
    expect(spellOut('Lê Đức')[2].letter).toBeUndefined()
  })

  it('chữ có dấu tổ hợp (NFD) vẫn nhận ra Umlaut', () => {
    expect(spellOut('ü')[0].letter?.name).toBe('ü')
  })
})
