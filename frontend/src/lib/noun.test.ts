import { describe, expect, it } from 'vitest'
import { articleOf, headword } from './noun'

describe('articleOf', () => {
  it('đọc mạo từ đứng đầu', () => {
    expect(articleOf('der Tisch')).toBe('der')
    expect(articleOf('Die Mutter, ¨')).toBe('die')
    expect(articleOf('das Bild, -er')).toBe('das')
  })

  it('không tô màu khi không chắc giống', () => {
    expect(articleOf('der/die Angestellte, -n')).toBeNull()
    expect(articleOf('Deutschland')).toBeNull()
    expect(articleOf('derselbe')).toBeNull()
    expect(articleOf('die Eltern (Pl.)')).toBeNull()
  })
})

describe('headword', () => {
  it('bỏ ký hiệu số nhiều khi đã có dòng số nhiều riêng', () => {
    expect(headword({ germanWord: 'das Bild, -er', plural: 'Bilder' })).toBe('das Bild')
    expect(headword({ germanWord: 'die Mutter, ¨', plural: 'Mütter' })).toBe('die Mutter')
  })

  it('giữ nguyên khi chưa biết số nhiều — ký hiệu là thông tin duy nhất', () => {
    expect(headword({ germanWord: 'die Maske, -n', plural: null })).toBe('die Maske, -n')
  })

  it('giữ nguyên cặp đực/cái', () => {
    const word = 'der Fahrer, -/die Fahrerin, -nen'
    expect(headword({ germanWord: word, plural: 'Fahrer' })).toBe(word)
  })
})
