export type FeedbackCriterion = {
  title: string
  label: 'Tốt' | 'Khá' | 'Cần luyện thêm' | null
  text: string
}

const CRITERION_TITLES = ['Hoàn thành nhiệm vụ', 'Từ vựng & ngữ pháp', 'Mạch lạc & tự nhiên', 'Gợi ý cải thiện']

/**
 * Splits the AI's raw feedback text (format: "1. [Tốt/Khá/Cần luyện thêm] giải thích" per line,
 * item 4 has no label) into structured criteria for display as separate cards. Falls back
 * gracefully (no label, whole line as text) if the AI didn't follow the exact format.
 */
export function parseFeedback(feedback: string): FeedbackCriterion[] {
  const parts = feedback
    .split(/(?=\d+\.\s)/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (parts.length === 0) return []

  return parts.map((part, i) => {
    const withoutNumber = part.replace(/^\d+\.\s*/, '')
    const match = withoutNumber.match(/^\[?(Tốt|Khá|Cần luyện thêm)\]?\s*[-–—:]?\s*(.*)$/i)
    return {
      title: CRITERION_TITLES[i] ?? `Tiêu chí ${i + 1}`,
      label: match ? (match[1] as FeedbackCriterion['label']) : null,
      text: (match ? match[2] : withoutNumber).trim(),
    }
  })
}
