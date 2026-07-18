import type { QuestionDisplay } from '../../lib/quiz'

export default function QuestionSentence({ display, className }: { display: QuestionDisplay; className?: string }) {
  if (!display.highlightWord) return <p className={className}>{display.text}</p>

  // Case-insensitive lookup (sentence-initial capitalization shouldn't hide the match), but slice
  // the original text so the actual capitalization on screen is preserved.
  const idx = display.text.toLowerCase().indexOf(display.highlightWord.toLowerCase())
  if (idx === -1) return <p className={className}>{display.text}</p>

  const matched = display.text.slice(idx, idx + display.highlightWord.length)

  return (
    <p className={className}>
      {display.text.slice(0, idx)}
      <span className="font-bold text-primary underline decoration-2 underline-offset-2">{matched}</span>
      {display.text.slice(idx + display.highlightWord.length)}
    </p>
  )
}
