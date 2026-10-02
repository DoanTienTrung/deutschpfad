import { describe, expect, it } from 'vitest'
import { questionDisplay } from './quiz'

describe('questionDisplay với định dạng từ điển của dữ liệu giáo trình', () => {
  it('đục lỗ được từ có ký hiệu số nhiều khi câu ví dụ dùng đúng dạng từ điển', () => {
    // Trước đây so "Bild, -er" với "Bild" → không bao giờ khớp → không bao giờ có kiểu gõ/chọn.
    const display = questionDisplay({
      germanWord: 'das Bild, -er',
      exampleSentence: 'Das Bild ist schön.',
      exampleSentenceHighlight: 'Bild',
    })
    expect(display).toEqual({ text: 'Das _____ ist schön.', highlightWord: null })
  })

  it('dạng biến cách khác dạng từ điển thì gạch chân, không đục lỗ', () => {
    const display = questionDisplay({
      germanWord: 'das Bild, -er',
      exampleSentence: 'Sehen Sie die Bilder an.',
      exampleSentenceHighlight: 'Bilder',
    })
    expect(display).toEqual({ text: 'Sehen Sie die Bilder an.', highlightWord: 'Bilder' })
  })

  it('không có highlight: vẫn tìm được từ có chú thích (Sg.) trong câu', () => {
    const display = questionDisplay({
      germanWord: 'die Musik (Sg.)',
      exampleSentence: 'Ich höre die Musik gern.',
      exampleSentenceHighlight: null,
    })
    expect(display).toEqual({ text: 'Ich höre _____ gern.', highlightWord: null })
  })
})
