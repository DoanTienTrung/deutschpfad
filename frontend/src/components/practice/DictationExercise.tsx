import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { AnswerFeedback, Button, Card, Field, Input, QuestionNav } from '@kit'
import type { VocabularyItem } from '../../api/types'
import type { PracticeResultHandler } from '../../lib/practiceResult'
import { questionDisplay, shuffle } from '../../lib/quiz'
import { checkAnswer, spokenForm } from '../../lib/answer'
import AudioBar from './AudioBar'
import QuestionSentence from './QuestionSentence'

const ADVANCE_DELAY_MS = 700
const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

export default function DictationExercise({
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
  const [attemptFailed, setAttemptFailed] = useState(false)
  const [revealAnswer, setRevealAnswer] = useState(false)
  const [justCorrect, setJustCorrect] = useState(false)
  const [articleHint, setArticleHint] = useState<string | null>(null)
  const [answeredIndexes, setAnsweredIndexes] = useState<Set<number>>(new Set())
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  // Câu nào đã báo kết quả lần thử đầu — xem ghi chú cùng chỗ trong TypeWordExercise.
  const reportedRef = useRef<Set<number>>(new Set())

  const finished = order.length > 0 && answeredIndexes.size === order.length

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    }
  }, [])

  if (items.length === 0) {
    return <p className="text-radiert">Bài học này chưa có từ vựng.</p>
  }

  const current = order[index]

  function goTo(i: number) {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current)
    setIndex(i)
    setInput('')
    setAttemptFailed(false)
    setRevealAnswer(false)
    setJustCorrect(false)
    setArticleHint(null)
  }

  function handleCheck() {
    if (answeredIndexes.has(index) || !input.trim() || justCorrect) return
    const result = checkAnswer(input, current.germanWord)
    setArticleHint(result.correct ? null : result.articleHint)
    if (!reportedRef.current.has(index)) {
      reportedRef.current.add(index)
      onResult?.(current, result.correct)
    }
    if (result.correct) {
      setAnsweredIndexes((prev) => new Set(prev).add(index))
      setJustCorrect(true)
      advanceTimeoutRef.current = setTimeout(() => {
        if (index < order.length - 1) {
          goTo(index + 1)
        } else {
          setInput('')
          setAttemptFailed(false)
          setRevealAnswer(false)
          setJustCorrect(false)
        }
      }, ADVANCE_DELAY_MS)
    } else if (!attemptFailed) {
      setAttemptFailed(true)
    } else {
      setRevealAnswer(true)
      setInput('')
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleCheck()
  }

  function insertChar(char: string) {
    const el = inputRef.current
    const start = el?.selectionStart ?? input.length
    const end = el?.selectionEnd ?? input.length
    const next = input.slice(0, start) + char + input.slice(end)
    setInput(next)
    setAttemptFailed(false)
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
        {/* Đọc dạng nói được, không đọc nguyên germanWord: "das Bild, -er" sẽ bị đọc thành
            "das Bild, trừ e-r" - mà đây là bài chính tả, người học gõ lại đúng cái mình nghe. */}
        <AudioBar text={spokenForm(current.germanWord)} />

        <div className="mt-4">
          {current.wordType && <p className="text-xs font-medium uppercase text-radiert">{current.wordType}</p>}
          <p className="mt-1 text-xl font-bold text-bleistift">{current.vietnameseMeaning}</p>
          {current.englishMeaning && <p className="mt-1 italic text-radiert">= {current.englishMeaning}</p>}
          {current.phonetic && <p className="mt-1 italic text-bleistift">/{current.phonetic}/</p>}
          {questionDisplay(current) && (
            <QuestionSentence display={questionDisplay(current)!} className="mt-3 text-base text-bleistift" />
          )}
        </div>

        <div className="mt-4 border-t border-linie pt-4">
          {!answeredIndexes.has(index) || justCorrect ? (
            <>
              <Field label="Nghe và gõ lại từ tiếng Đức" className="text-left">
                <Input ref={inputRef} value={input} onChange={(e) => { setInput(e.target.value); setAttemptFailed(false) }}
                  onKeyDown={handleKeyDown} autoComplete="off" autoFocus readOnly={justCorrect}
                  invalid={attemptFailed} className={justCorrect ? 'border-aufstieg' : undefined} />
              </Field>
              {!justCorrect && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs text-radiert">Không gõ được dấu?</span>
                  {UMLAUT_KEYS.map((key) => (
                    <Button key={key} variant="secondary" size="sm" onClick={() => insertChar(key)} aria-label={`Thêm chữ ${key}`}>
                      {key}
                    </Button>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={handleCheck} disabled={justCorrect} icon={<Check className="size-4" aria-hidden="true" />}>
                  Kiểm tra
                </Button>
              </div>
              {justCorrect ? (
                <AnswerFeedback correct className="mt-3 text-left" />
              ) : revealAnswer ? (
                <AnswerFeedback correct={false} className="mt-3 text-left" title="Chưa đúng. Gõ lại cho đúng để qua câu mới.">
                  {articleHint ? `${articleHint}. Đáp án đầy đủ: "${current.germanWord}".` : `Đáp án là "${current.germanWord}".`}
                </AnswerFeedback>
              ) : (
                attemptFailed && (
                  <AnswerFeedback correct={false} className="mt-3 text-left" title={articleHint ?? 'Chưa đúng, thử lại nhé.'} />
                )
              )}
            </>
          ) : (
            <AnswerFeedback correct className="text-left" title={`Đã hoàn thành: "${current.germanWord}"`} />
          )}
        </div>
      </Card>

      <p className="mb-2 font-medium text-bleistift">Danh sách bài tập:</p>
      <QuestionNav current={index} onSelect={goTo} marks={order.map((_, i) => (answeredIndexes.has(i) ? 'correct' : 'open'))} />
    </div>
  )
}
