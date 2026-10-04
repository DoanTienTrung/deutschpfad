/**
 * So khớp câu trả lời tiếng Đức người học gõ vào với từ trong kho.
 *
 * Trường germanWord KHÔNG phải là "thứ người học phải gõ" — nó là cách ghi kiểu từ điển, mang
 * theo cả thông tin phụ. Kho giáo trình A1 (1.736 từ) dùng ít nhất các kiểu sau:
 *
 *   das Bild, -er                         → số nhiều sau dấu phẩy
 *   der Polizist, -en/die Polizistin, -nen → cặp đực/cái, ngăn bằng "/"
 *   der/die Angestellte                   → hai mạo từ cho cùng một từ
 *   die Musik (Sg.)  ·  zeigen (gezeigt)  → chú thích trong ngoặc (bỏ đi)
 *   der Meter (m), -                      → viết tắt trong ngoặc (bỏ đi)
 *   (das) Deutsch  ·  das Kilo(gramm)     → phần TUỲ CHỌN (chấp nhận cả có lẫn không)
 *   ab-fahren                             → gạch nối đánh dấu động từ tách được
 *
 * Trước đây code so nguyên chuỗi, nên người học phải gõ cả ", -er" hay "(Sg.)" mới được tính
 * đúng — khoảng 1.000 từ giáo trình không thể gõ đúng được.
 */

const ARTICLE_ONLY = /^(der|die|das)$/i
const WITH_ARTICLE = /^(der|die|das)\s+(.+)$/i

/**
 * Chuẩn hoá để so sánh hai chuỗi.
 *
 * Umlaut được ĐỔI thành cặp chữ (ä → ae) chứ KHÔNG bị bỏ. Bản cũ dùng
 * `normalize('NFD').replace(dấu phụ)` — mà trong Unicode, dấu Umlaut chính là một dấu phụ, nên
 * "schön" (đẹp) và "schon" (đã) bị coi là một, "Bär" (con gấu) và "Bar" (quán bar) cũng vậy.
 * Chấp nhận "ae" là vì bàn phím tiếng Việt không có sẵn phím ä — giống cách phần Ngữ pháp chấm.
 */
export function normalizeAnswer(text: string): string {
  return (
    text
      // Gộp về dạng NFC trước: "ä" gõ từ một số bàn phím là hai ký tự (a + dấu ¨ kết hợp).
      .normalize('NFC')
      .toLowerCase()
      // Umlaut → cặp chữ, PHẢI làm trước bước bỏ dấu phụ bên dưới.
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      // Các dấu phụ còn lại thì bỏ: từ mượn như "Café", người học gõ "Cafe" vẫn đúng.
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      // Gạch nối của động từ tách được (ab-fahren), dấu chấm giữa (ab·fahren), gạch đứng.
      .replace(/[-·|]/g, '')
      // Dấu câu không mang nghĩa khi gõ một từ / cụm từ ngắn.
      .replace(/\.\.\.|…/g, ' ')
      .replace(/[.?!]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/** Tách theo `sep` nhưng bỏ qua ký tự nằm trong ngoặc — vd. "/" trong "(m²/qm)". */
function splitOutsideParens(text: string, sep: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const ch of text) {
    if (ch === '(') depth++
    if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === sep && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  parts.push(current)
  return parts
}

/**
 * Mở rộng phần tuỳ chọn trong ngoặc thành mọi biến thể. Bản CÓ phần tuỳ chọn đứng trước, nên
 * phần tử đầu tiên luôn là dạng đầy đủ nhất — dùng làm cách phát âm.
 *   "das Kilo(gramm)"  → ["das Kilogramm", "das Kilo"]
 *   "(das) Deutsch"    → ["das Deutsch", "Deutsch"]
 */
function expandOptional(text: string): string[] {
  const match = /\(([^()]*)\)/.exec(text)
  if (!match) return [text]
  const before = text.slice(0, match.index)
  const after = text.slice(match.index + match[0].length)
  // "(Regen-)Schirm": gạch nối cuối phần tuỳ chọn là ký hiệu TỪ GHÉP — nối liền và viết thường
  // chữ đầu phần sau, ra "Regenschirm" chứ không phải "Regen-Schirm".
  const withPart = match[1].endsWith('-')
    ? before + match[1].slice(0, -1) + after.charAt(0).toLowerCase() + after.slice(1)
    : before + match[1] + after
  return [...expandOptional(withPart), ...expandOptional(before + after)]
}

function tidy(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Mọi cách gõ được chấp nhận cho một từ, ở dạng hiển thị (chưa chuẩn hoá). Luôn có ít nhất một
 * phần tử nếu germanWord có chữ cái.
 */
export function acceptedAnswers(germanWord: string): string[] {
  let text = germanWord.trim()

  // "Senioren (Pl.): Senioren-" — phần sau dấu hai chấm là ghi chú về cách dùng.
  const colon = text.indexOf(':')
  if (colon > 0) text = text.slice(0, colon)

  // Ngoặc CHÚ THÍCH: có khoảng trắng phía trước VÀ không dính vào chữ phía sau — (Sg.), (Pl.),
  // (gezeigt), (kg), (sein)… Bỏ hẳn. Phải làm TRƯỚC khi tách "/" vì "/" có thể nằm trong ngoặc.
  // Ngoặc ở đầu chuỗi "(das) Deutsch" hay dính vào chữ "Kilo(gramm)", "(Regen-)Schirm" là phần
  // tuỳ chọn, giữ lại để expandOptional() xử lý.
  text = text.replace(/\s+\([^)]*\)(?=\s|,|\/|$)/g, '')

  // Mỗi phương án ngăn bằng "/", bỏ phần số nhiều sau dấu phẩy.
  const alternatives = splitOutsideParens(text, '/').map((alt) => tidy(splitOutsideParens(alt, ',')[0]))

  const resolved: string[] = []
  alternatives.forEach((alt, i) => {
    // "der/die Angestellte": phương án chỉ có mạo từ mượn danh từ của phương án đứng sau.
    if (ARTICLE_ONLY.test(alt)) {
      const next = alternatives.slice(i + 1).map((a) => WITH_ARTICLE.exec(a)).find(Boolean)
      if (next) resolved.push(`${alt} ${next[2]}`)
      return
    }
    // Mảnh số nhiều lạc ra ngoài ("-n", "¨e", "=er") hoặc rỗng: không phải một cách gõ.
    if (!alt || /^[-¨=]/.test(alt) || !/\p{L}/u.test(alt)) return
    resolved.push(alt)
  })

  const seen = new Set<string>()
  const result: string[] = []
  for (const alt of resolved) {
    for (const variant of expandOptional(alt).map(tidy)) {
      const key = normalizeAnswer(variant)
      if (key && !seen.has(key)) {
        seen.add(key)
        result.push(variant)
      }
    }
  }
  return result
}

/**
 * Chuỗi đưa cho máy đọc. Trước đây máy đọc nguyên germanWord: "das Bild, -er" thành "das Bild,
 * trừ e-r", và đọc cả "(Sg.)" — ngay trong chế độ chính tả, nơi người học phải gõ lại đúng cái
 * mình nghe.
 */
export function spokenForm(germanWord: string): string {
  const first = acceptedAnswers(germanWord)[0]
  if (!first) return germanWord
  return first
    .replace(/(\p{L})-(\p{Ll})/gu, '$1$2') // ab-fahren → abfahren (giữ E-Mail vì M viết hoa)
    .replace(/^-+|-+$/g, '') //               hell- → hell
}

export type AnswerCheck =
  | { correct: true }
  | {
      correct: false
      /** Có giá trị khi người học gõ đúng danh từ nhưng sai hoặc thiếu mạo từ. */
      articleHint: string | null
    }

/**
 * Chấm câu trả lời. Khi sai, nếu đúng danh từ mà sai/thiếu mạo từ thì trả về gợi ý cụ thể —
 * "đúng từ nhưng sai mạo từ: der → die" dạy giống của danh từ nhanh hơn nhiều so với chỉ "sai".
 */
export function checkAnswer(input: string, germanWord: string): AnswerCheck {
  const typed = normalizeAnswer(input)
  if (!typed) return { correct: false, articleHint: null }

  // Gõ nguyên văn đúng thứ đang hiển thị ("das Bild, -er") cũng phải được tính là đúng.
  if (typed === normalizeAnswer(germanWord)) return { correct: true }

  const answers = acceptedAnswers(germanWord)
  if (answers.some((a) => normalizeAnswer(a) === typed)) return { correct: true }

  const typedArticle = /^(der|die|das) /.exec(typed)?.[1] ?? null
  const typedNoun = typedArticle ? typed.slice(typedArticle.length + 1) : typed
  for (const answer of answers) {
    const parts = WITH_ARTICLE.exec(answer)
    if (!parts || normalizeAnswer(parts[2]) !== typedNoun) continue
    const expected = parts[1].toLowerCase()
    return {
      correct: false,
      articleHint: typedArticle
        ? `Đúng từ nhưng sai mạo từ: "${typedArticle}" → "${expected}"`
        : `Thiếu mạo từ - phải là "${expected} ${parts[2]}"`,
    }
  }
  return { correct: false, articleHint: null }
}

export function isCorrectAnswer(input: string, germanWord: string): boolean {
  return checkAnswer(input, germanWord).correct
}
