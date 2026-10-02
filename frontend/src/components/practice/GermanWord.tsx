import { ARTICLE_LABEL, articleOf, headword } from '../../lib/noun'

const ARTICLE_COLOR = {
  der: 'text-der',
  die: 'text-die',
  das: 'text-das',
} as const

/** Từ tiếng Đức với mạo từ tô màu theo giống. Chỉ dùng ở chỗ HIỂN THỊ — đừng dùng trong đáp án
 *  trắc nghiệm, màu sẽ lộ mạo từ. */
export function GermanWord({ item, className = '' }: { item: { germanWord: string; plural: string | null }; className?: string }) {
  const text = headword(item)
  const article = articleOf(text)
  if (!article) return <span className={className}>{text}</span>
  return (
    <span className={className}>
      <span className={ARTICLE_COLOR[article]} title={ARTICLE_LABEL[article]}>
        {text.slice(0, article.length)}
      </span>
      {text.slice(article.length)}
    </span>
  )
}

// "die" của số nhiều KHÔNG tô màu: nó không phải giống cái, tô cùng màu sẽ dạy sai.
export function PluralLine({ plural, className = '' }: { plural: string | null; className?: string }) {
  if (!plural) return null
  return <span className={className}>Số nhiều: die {plural}</span>
}
