import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnswerFeedback, Button, Card, Field, Input, QuestionNav } from '@kit'
import type { VocabularyItem } from '../../api/types'
import type { PracticeResultHandler } from '../../lib/practiceResult'
import { questionDisplay, shuffle } from '../../lib/quiz'
import { checkAnswer } from '../../lib/answer'
import QuestionSentence from './QuestionSentence'

const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

export default function TypeWordExercise({
  items,
  onComplete,
  onResult,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
  onResult?: PracticeResultHandler
}) {
  const [order] = useState(() => shuffle(items))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [revealAnswer, setRevealAnswer] = useState(false)
  const [articleHint, setArticleHint] = useState<string | null>(null)
  const [answeredIndexes, setAnsweredIndexes] = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement | null>(null)
  // Câu nào đã báo kết quả lần thử đầu. Gõ sai thì phải gõ lại cho đúng mới qua câu — lần gõ lại
  // đó là chép đáp án vừa thấy, không còn đo việc nhớ nên không báo nữa. Dùng ref vì không
  // ảnh hưởng tới giao diện.
  const reportedRef = useRef<Set<number>>(new Set())

  const finished = order.length > 0 && answeredIndexes.size === order.length

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  if (items.length === 0) {
    return <p className="text-radiert">Bài học này chưa có từ vựng.</p>
  }

  const current = order[index]

  function goTo(i: number) {
    setIndex(i)
    setInput('')
    setRevealAnswer(false)
    setArticleHint(null)
  }

  function handleSubmit() {
    if (answeredIndexes.has(index) || !input.trim()) return
    const result = checkAnswer(input, current.germanWord)
    if (!reportedRef.current.has(index)) {
      reportedRef.current.add(index)
      onResult?.(current, result.correct)
    }
    if (result.correct) {
      setAnsweredIndexes((prev) => new Set(prev).add(index))
      if (index < order.length - 1) {
        goTo(index + 1)
      } else {
        setInput('')
        setRevealAnswer(false)
      }
    } else {
      setRevealAnswer(true)
      setArticleHint(result.articleHint)
      setInput('')
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  function insertChar(char: string) {
    const el = inputRef.current
    const start = el?.selectionStart ?? input.length
    const end = el?.selectionEnd ?? input.length
    const next = input.slice(0, start) + char + input.slice(end)
    setInput(next)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + char.length, start + char.length)
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button variant="secondary" size="sm" icon={<ArrowLeft className="size-4" aria-hidden="true" />}
          onClick={() => goTo(Math.max(0, index - 1))} disabled={index === 0}>
          Câu trước
        </Button>
        <p className="text-sm text-radiert">
          Đã hoàn thành {answeredIndexes.size}/{order.length}
        </p>
        <Button variant="secondary" size="sm" onClick={() => goTo(Math.min(order.length - 1, index + 1))}
          disabled={index === order.length - 1}>
          Câu sau
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <Card className="mb-6 p-6 text-center">
        {questionDisplay(current) && (
          <QuestionSentence display={questionDisplay(current)!} className="text-lg font-medium text-bleistift" />
        )}
        <p className="mt-4 text-sm text-radiert">
          Hint: {current.englishMeaning ? `${current.englishMeaning} ` : ''}
          {current.englishMeaning ? `(${current.vietnameseMeaning})` : current.vietnameseMeaning}
        </p>
      </Card>

      {!answeredIndexes.has(index) && (
        <>
          <div className={revealAnswer ? 'answer-shake' : ''}>
            <Field label="Gõ từ tiếng Đức, rồi nhấn Enter">
              <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                autoComplete="off" autoFocus invalid={revealAnswer} />
            </Field>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-radiert">Không gõ được dấu?</span>
            {UMLAUT_KEYS.map((key) => (
              <Button key={key} variant="secondary" size="sm" onClick={() => insertChar(key)} aria-label={`Thêm chữ ${key}`}>
                {key}
              </Button>
            ))}
          </div>
        </>
      )}

      {revealAnswer && !answeredIndexes.has(index) && (
        <AnswerFeedback correct={false} className="mt-3" title="Chưa đúng. Gõ lại cho đúng để qua câu mới.">
          {articleHint ? `${articleHint}. Đáp án đầy đủ: "${current.germanWord}".` : `Đáp án là "${current.germanWord}".`}
        </AnswerFeedback>
      )}

      {answeredIndexes.has(index) && (
        <AnswerFeedback correct title={`Đã hoàn thành: "${current.germanWord}"`} />
      )}

      <p className="mt-6 mb-2 font-medium text-bleistift">Danh sách bài tập:</p>
      <QuestionNav current={index} onSelect={goTo} marks={order.map((_, i) => (answeredIndexes.has(i) ? 'correct' : 'open'))} />
    </div>
  )
}
