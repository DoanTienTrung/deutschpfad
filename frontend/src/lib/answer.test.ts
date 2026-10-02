import { describe, expect, it } from 'vitest'
import { acceptedAnswers, checkAnswer, isCorrectAnswer, spokenForm } from './answer'

describe('Umlaut', () => {
  // Bản cũ xoá mọi dấu phụ — mà Umlaut là một dấu phụ — nên mọi cặp dưới đây đều bị chấm ĐÚNG.
  it.each([
    ['schon', 'schön'], // đã  ≠  đẹp
    // Có mạo từ ở cả hai bên: nếu thiếu, test sẽ sai vì "thiếu mạo từ" chứ không phải vì Umlaut,
    // và pass ngay cả với code lỗi cũ — kiểm đột biến đã bắt được đúng chuyện này.
    ['die Bar', 'der Bär'], // quán bar  ≠  con gấu  (khác cả giống)
    ['der Bar', 'der Bär'],
    ['zahlen', 'zählen'], // trả tiền  ≠  đếm
    ['drucken', 'drücken'], // in  ≠  bấm
    ['Mutter', 'Mütter'], // mẹ  ≠  các bà mẹ
  ])('bỏ Umlaut là SAI: gõ "%s" cho "%s"', (typed, answer) => {
    expect(isCorrectAnswer(typed, answer)).toBe(false)
  })

  it('chấp nhận gõ ae/oe/ue/ss thay cho ä/ö/ü/ß (bàn phím không có sẵn)', () => {
    expect(isCorrectAnswer('schoen', 'schön')).toBe(true)
    expect(isCorrectAnswer('zaehlen', 'zählen')).toBe(true)
    expect(isCorrectAnswer('Strasse', 'die Straße')).toBe(false) // thiếu mạo từ
    expect(isCorrectAnswer('die Strasse', 'die Straße')).toBe(true)
  })

  it('chấp nhận ä gõ ở dạng tổ hợp (a + dấu ¨ kết hợp) và chữ hoa', () => {
    expect(isCorrectAnswer('schön', 'schön')).toBe(true)
    expect(isCorrectAnswer('SCHÖN', 'schön')).toBe(true)
  })

  it('vẫn bỏ qua dấu phụ KHÔNG phải Umlaut, như é trong từ mượn', () => {
    expect(isCorrectAnswer('das Cafe', 'das Café')).toBe(true)
  })
})

describe('Định dạng kiểu từ điển của dữ liệu giáo trình', () => {
  it('bỏ số nhiều sau dấu phẩy', () => {
    expect(acceptedAnswers('das Bild, -er')).toEqual(['das Bild'])
    expect(acceptedAnswers('der Hals, =e')).toEqual(['der Hals'])
    expect(acceptedAnswers('die Herkunft, ¨e')).toEqual(['die Herkunft'])
  })

  it('gõ nguyên văn thứ đang hiển thị cũng được tính là đúng', () => {
    expect(isCorrectAnswer('das Bild, -er', 'das Bild, -er')).toBe(true)
  })

  it('cặp đực/cái: gõ dạng nào cũng đúng', () => {
    const word = 'der Polizist, -en/die Polizistin, -nen'
    expect(acceptedAnswers(word)).toEqual(['der Polizist', 'die Polizistin'])
    expect(isCorrectAnswer('die Polizistin', word)).toBe(true)
  })

  it('"der/die X": mạo từ đứng một mình mượn danh từ phía sau', () => {
    expect(acceptedAnswers('der/die Angestellte, -n')).toEqual(['der Angestellte', 'die Angestellte'])
  })

  it('bỏ chú thích trong ngoặc: (Sg.), (Pl.), Partizip II, viết tắt', () => {
    expect(acceptedAnswers('die Musik (Sg.)')).toEqual(['die Musik'])
    expect(acceptedAnswers('die Eltern (Pl.)')).toEqual(['die Eltern'])
    expect(acceptedAnswers('zeigen (gezeigt)')).toEqual(['zeigen'])
    expect(acceptedAnswers('verbinden (mit) (verbunden)')).toEqual(['verbinden'])
  })

  it('"/" nằm TRONG ngoặc không bị coi là ngăn cách phương án', () => {
    expect(acceptedAnswers('der Quadratmeter (m²/qm), -')).toEqual(['der Quadratmeter'])
  })

  it('phần tuỳ chọn: chấp nhận cả có lẫn không', () => {
    expect(acceptedAnswers('(das) Deutsch')).toEqual(['das Deutsch', 'Deutsch'])
    expect(acceptedAnswers('das Kilo(gramm) (kg) (Sg.)')).toEqual(['das Kilogramm', 'das Kilo'])
    // Gạch nối trong ngoặc là ký hiệu từ ghép → "Regenschirm", không phải "Regen-Schirm".
    expect(acceptedAnswers('der (Regen-)Schirm, -e')).toEqual(['der Regenschirm', 'der Schirm'])
  })

  it('động từ tách được viết có gạch nối: gõ liền vẫn đúng', () => {
    expect(isCorrectAnswer('abfahren', 'ab-fahren (abgefahren)')).toBe(true)
  })

  it('bỏ qua dấu câu cuối', () => {
    expect(isCorrectAnswer('Wie bitte', 'Wie bitte?')).toBe(true)
  })

  it('mảnh số nhiều lạc ra sau "/" không trở thành một cách gõ', () => {
    // Nếu không lọc, "-¨e" sẽ chuẩn hoá thành "e" và gõ mỗi chữ "e" cũng được tính là đúng.
    expect(acceptedAnswers('die Bank, -en/-¨e')).toEqual(['die Bank'])
    expect(isCorrectAnswer('e', 'die Bank, -en/-¨e')).toBe(false)
  })
})

describe('Gợi ý mạo từ', () => {
  it('đúng danh từ nhưng sai mạo từ', () => {
    expect(checkAnswer('der Bild', 'das Bild, -er')).toEqual({
      correct: false,
      articleHint: 'Đúng từ nhưng sai mạo từ: "der" → "das"',
    })
  })

  it('đúng danh từ nhưng thiếu mạo từ', () => {
    expect(checkAnswer('Bild', 'das Bild, -er')).toEqual({
      correct: false,
      articleHint: 'Thiếu mạo từ — phải là "das Bild"',
    })
  })

  it('sai hẳn từ thì không có gợi ý mạo từ', () => {
    expect(checkAnswer('das Buch', 'das Bild, -er')).toEqual({ correct: false, articleHint: null })
  })

  it('không đưa gợi ý mạo từ khi đáp án vốn không có mạo từ', () => {
    expect(checkAnswer('fahren', 'ab-fahren')).toEqual({ correct: false, articleHint: null })
  })
})

describe('Phát âm', () => {
  it('không đọc ký hiệu số nhiều hay chú thích', () => {
    expect(spokenForm('das Bild, -er')).toBe('das Bild')
    expect(spokenForm('die Musik (Sg.)')).toBe('die Musik')
  })

  it('nối gạch nối của động từ tách được, nhưng giữ gạch nối thật như E-Mail', () => {
    expect(spokenForm('ab-fahren (abgefahren)')).toBe('abfahren')
    expect(spokenForm('E-Mail')).toBe('E-Mail')
  })

  it.each([
    'das Bild, -er',
    'der Polizist, -en/die Polizistin, -nen',
    '(das) Deutsch',
    'das Kilo(gramm) (kg) (Sg.)',
    'der (Regen-)Schirm, -e',
    'ab-fahren (abgefahren)',
    'eu(e)r-',
    'Wie bitte?',
  ])('thứ máy ĐỌC RA phải được chấm là đúng: %s', (word) => {
    // Chế độ chính tả: người học gõ đúng điều mình nghe thì phải được tính đúng.
    expect(isCorrectAnswer(spokenForm(word), word)).toBe(true)
  })
})
