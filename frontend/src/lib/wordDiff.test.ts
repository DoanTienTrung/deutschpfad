import { describe, expect, it } from 'vitest'
import { diffWords, firstLetterHint, wordBankTokens } from './wordDiff'

describe('diffWords', () => {
  it('đánh dấu từ đã sửa, bỏ qua dấu câu dính vào từ', () => {
    const result = diffWords('Gestern hat ich Reis gekocht', 'Gestern habe ich Reis gekocht.')
    expect(result.map((w) => [w.text, w.changed])).toEqual([
      ['Gestern', false],
      ['habe', true],
      ['ich', false],
      ['Reis', false],
      ['gekocht.', false],
    ])
  })

  it('tính hoa thường là khác', () => {
    expect(diffWords('ich habe ein auto', 'Ich habe ein Auto').filter((w) => w.changed).map((w) => w.text)).toEqual([
      'Ich',
      'Auto',
    ])
  })

  it('từ thêm vào ở giữa', () => {
    expect(diffWords('Ich wohne Berlin', 'Ich wohne in Berlin').map((w) => w.changed)).toEqual([false, false, true, false])
  })
})

describe('firstLetterHint', () => {
  it('giữ chữ cái đầu, dấu câu và umlaut', () => {
    expect(firstLetterHint('Ich fahre nach München.')).toBe('I__ f____ n___ M______.')
  })
})

describe('wordBankTokens', () => {
  it('đủ các từ, bỏ dấu cuối câu, xáo cố định theo seed và không trùng thứ tự gốc', () => {
    const tokens = wordBankTokens('Gestern habe ich Reis gekocht.', 7)
    expect([...tokens].sort()).toEqual(['Gestern', 'Reis', 'gekocht', 'habe', 'ich'])
    expect(wordBankTokens('Gestern habe ich Reis gekocht.', 7)).toEqual(tokens)
    expect(tokens).not.toEqual(['Gestern', 'habe', 'ich', 'Reis', 'gekocht'])
  })
})
