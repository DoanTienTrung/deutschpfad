// Hiển thị danh từ: mạo từ tô màu theo giống, số nhiều tách thành dòng riêng.

export type Article = 'der' | 'die' | 'das'

export const ARTICLE_LABEL: Record<Article, string> = {
  der: 'giống đực',
  die: 'giống cái',
  das: 'giống trung',
}

/**
 * Mạo từ đứng đầu, nếu có đúng MỘT mạo từ. "der/die Angestellte" (hai giống), từ không phải danh
 * từ, và danh từ chỉ có số nhiều ("die Eltern (Pl.)" — "die" ở đây là mạo từ số nhiều, không phải
 * giống cái) trả về null — không tô màu còn hơn tô sai.
 */
export function articleOf(germanWord: string): Article | null {
  if (/\(Pl\.?\)/.test(germanWord)) return null
  const m = /^(der|die|das)\s/i.exec(germanWord.trim())
  return m ? (m[1].toLowerCase() as Article) : null
}

/**
 * Chữ để hiện làm tiêu đề thẻ. Đã có số nhiều ở dòng riêng thì bỏ ký hiệu "das Bild, -er" →
 * "das Bild". Chỉ bỏ ở dạng đơn giản "mạo từ + từ, ký hiệu"; cặp "der Fahrer, -/die Fahrerin, -nen"
 * giữ nguyên vì dạng giống cái nằm sau ký hiệu.
 */
export function headword(item: { germanWord: string; plural: string | null }): string {
  if (!item.plural) return item.germanWord
  const m = /^((?:der|die|das)\s[^,/]+),\s*[^,/]+$/i.exec(item.germanWord.trim())
  return m ? m[1].trim() : item.germanWord
}
