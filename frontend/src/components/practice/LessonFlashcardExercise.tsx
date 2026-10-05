import { useEffect, useMemo, useRef, useState } from 'react'
import { submitReview } from '../../api/vocabularyApi'
import type { VocabularyItem, ReviewQuality } from '../../api/types'
import { buildChoices, questionDisplay, shuffle, type QuestionDisplay } from '../../lib/quiz'
import { checkAnswer, spokenForm } from '../../lib/answer'
import { speak } from '../../lib/speech'
import Alert from '../ui/Alert'
import SpeakerIcon from '../ui/SpeakerIcon'
import QuestionSentence from './QuestionSentence'
import { GermanWord, PluralLine } from './GermanWord'

const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']
const BLANK = '_____'
const CHOICE_LETTERS = ['A', 'B', 'C', 'D']

// Mixing in fill-the-blank / multiple-choice cards (alongside the classic flip card) keeps
// flashcard review from getting monotonous, while still ending on the same Quên/Nhớ/Dễ rating
// so spaced-repetition scheduling stays unaffected.
type CardMode = 'flip' | 'fill' | 'choice'

const MODE_LABEL: Record<CardMode, string> = { flip: 'Lật thẻ', fill: 'Điền từ', choice: 'Chọn từ' }

// Nhãn phụ giúp người học tự chấm cho đúng (kiểu lật thẻ không có đáp án khách quan).
const RATINGS: { quality: ReviewQuality; label: string; hint: string; key: string }[] = [
  { quality: 'FORGOT', label: 'Quên', hint: 'Ôn lại sớm', key: '1' },
  { quality: 'REMEMBERED', label: 'Nhớ', hint: 'Phải nghĩ', key: '2' },
  { quality: 'EASY', label: 'Dễ', hint: 'Nhớ ngay', key: '3' },
]

function hasBlankSentence(item: VocabularyItem): boolean {
  const display = questionDisplay(item)
  return display !== null && display.text.includes(BLANK)
}

export default function LessonFlashcardExercise({
  items,
  onComplete,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
}) {
  const [order] = useState(() => shuffle(items))
  const [cardModes] = useState<CardMode[]>(() =>
    order.map((item) => {
      if (!hasBlankSentence(item)) return 'flip'
      const pool: CardMode[] = ['flip', 'fill']
      if (items.length >= 4) pool.push('choice')
      return pool[Math.floor(Math.random() * pool.length)]
    })
  )
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [fillInput, setFillInput] = useState('')
  const [fillRevealed, setFillRevealed] = useState(false)
  const [fillCorrect, setFillCorrect] = useState(false)
  const [fillWrong, setFillWrong] = useState(false)
  // Có gõ sai ít nhất một lần, hoặc bấm "Xem đáp án" — xem ghi chú ở `objectiveOutcome`.
  const [fillMistake, setFillMistake] = useState(false)
  const [fillHint, setFillHint] = useState<string | null>(null)
  const [choiceSelected, setChoiceSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [tally, setTally] = useState<Record<ReviewQuality, number>>({ FORGOT: 0, REMEMBERED: 0, EASY: 0 })
  const fillInputRef = useRef<HTMLInputElement | null>(null)
  const nextButtonRef = useRef<HTMLButtonElement | null>(null)

  const finished = index >= order.length
  const mode = cardModes[index]
  const card = order[index]
  const revealed = finished
    ? false
    : mode === 'flip'
      ? flipped
      : mode === 'fill'
        ? fillRevealed
        : choiceSelected !== null

  // Ở kiểu gõ và kiểu chọn, hệ thống BIẾT người học đúng hay sai — không để họ tự chấm. Trước
  // đây cả ba kiểu đều kết thúc bằng 3 nút Quên/Nhớ/Dễ, nên gõ sai rồi bấm "Nhớ", hay bấm "Hiện
  // đáp án" rồi bấm "Dễ" đều được, và lịch ôn SM-2 bị đẩy xa cho một từ chưa hề nhớ.
  // Lần thử ĐẦU TIÊN quyết định: sai lần đầu thì ghi "Quên" — vẫn cho gõ lại để luyện, nhưng từ
  // này sẽ quay lại sớm. Kiểu lật thẻ không có tín hiệu khách quan nên giữ tự chấm.
  const objectiveOutcome: 'passed' | 'failed' | null = finished
    ? null
    : mode === 'fill'
      ? fillMistake
        ? 'failed'
        : 'passed'
      : mode === 'choice'
        ? choiceSelected === card.germanWord
          ? 'passed'
          : 'failed'
        : null
  const availableRatings =
    objectiveOutcome === 'failed'
      ? RATINGS.filter((r) => r.quality === 'FORGOT')
      : objectiveOutcome === 'passed'
        ? RATINGS.filter((r) => r.quality !== 'FORGOT')
        : RATINGS

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  // Lộ đáp án xong thì đưa focus sang nút chấm chính: Enter/Space là sang thẻ tiếp, không phải với chuột.
  useEffect(() => {
    if (revealed && mode !== 'flip') nextButtonRef.current?.focus()
  }, [revealed, mode, index])

  const choices = useMemo(() => {
    const item = order[index]
    if (!item || mode !== 'choice') return []
    return buildChoices(item.germanWord, items.map((i) => i.germanWord))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-shuffle choices only when moving to a different card
  }, [index])

  // Phím tắt: Space lật thẻ, 1-4 chọn đáp án, 1/2/3 chấm Quên/Nhớ/Dễ sau khi đã lộ đáp án.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished || submitting || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const typing = target instanceof HTMLInputElement && !target.readOnly
      if (typing || target instanceof HTMLTextAreaElement) return
      const onButton = target instanceof HTMLButtonElement

      if (mode === 'flip' && !flipped && (e.key === ' ' || e.key === 'Enter') && !onButton) {
        e.preventDefault()
        setFlipped(true)
        return
      }
      if (mode === 'choice' && choiceSelected === null) {
        const i = Number(e.key) - 1
        if (i >= 0 && i < choices.length) setChoiceSelected(choices[i])
        return
      }
      if (revealed) {
        const rating = availableRatings.find((r) => r.key === e.key)
        if (rating) handleAnswer(rating.quality)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (finished) {
    return <SessionSummary reviewed={order.length} tally={tally} />
  }

  function resetCardState() {
    setFlipped(false)
    setFillInput('')
    setFillRevealed(false)
    setFillCorrect(false)
    setFillWrong(false)
    setFillMistake(false)
    setFillHint(null)
    setChoiceSelected(null)
  }

  async function handleAnswer(quality: ReviewQuality) {
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await submitReview(card.id, quality)
      setTally((t) => ({ ...t, [quality]: t[quality] + 1 }))
      resetCardState()
      setIndex((i) => i + 1)
    } catch {
      setError('Không gửi được kết quả ôn tập, thử lại nhé.')
    } finally {
      setSubmitting(false)
    }
  }

  function insertFillChar(char: string) {
    const el = fillInputRef.current
    const start = el?.selectionStart ?? fillInput.length
    const end = el?.selectionEnd ?? fillInput.length
    const next = fillInput.slice(0, start) + char + fillInput.slice(end)
    setFillInput(next)
    setFillWrong(false)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + char.length, start + char.length)
    })
  }

  function handleFillReveal() {
    setFillCorrect(false)
    setFillWrong(false)
    setFillMistake(true)
    setFillHint(null)
    setFillRevealed(true)
  }

  function handleFillCheck() {
    if (fillRevealed || !fillInput.trim()) return
    const result = checkAnswer(fillInput, card.germanWord)
    if (result.correct) {
      setFillCorrect(true)
      setFillWrong(false)
      setFillHint(null)
      setFillRevealed(true)
    } else {
      setFillWrong(true)
      setFillMistake(true)
      setFillHint(result.articleHint)
      fillInputRef.current?.select()
    }
  }

  const display = questionDisplay(card)
  const progress = (index / order.length) * 100

  return (
    <div className="mx-auto max-w-xl">
      {/* Tiến độ phiên */}
      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium text-ink">
            Thẻ {index + 1} <span className="font-normal text-muted">/ {order.length}</span>
          </span>
          <span className="text-xs font-medium text-muted">{MODE_LABEL[mode]}</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-hairline"
          role="progressbar"
          aria-label="Tiến độ phiên ôn"
          aria-valuemin={0}
          aria-valuemax={order.length}
          aria-valuenow={index}
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert tone="danger">{error}</Alert>
        </div>
      )}

      {mode === 'flip' && (
        <div
          key={card.id}
          onClick={() => setFlipped((f) => !f)}
          className="flip-card h-80 cursor-pointer select-none"
          role="button"
          aria-label={flipped ? 'Lật lại mặt trước' : 'Lật thẻ để xem nghĩa'}
        >
          <div className={`flip-card-inner h-full ${flipped ? 'is-flipped' : ''}`}>
            <div className="flip-card-face relative flex h-full flex-col items-center justify-center rounded-xl border border-hairline bg-card px-8 text-center">
              <CardTags card={card} />
              <p className="font-display text-4xl font-semibold leading-tight text-ink">
                <GermanWord item={card} />
              </p>
              <PluralLine plural={card.plural} className="mt-2 block text-sm text-muted" />
              {card.phonetic && <p className="mt-1 text-sm text-muted">[{card.phonetic}]</p>}
              <SpeakButton word={card.germanWord} className="mt-5" />
              <p className="absolute inset-x-0 bottom-5 text-xs text-muted">
                Chạm để lật thẻ
                <span className="hidden sm:inline">
                  {' '}
                  <Kbd className="ml-1">Space</Kbd>
                </span>
              </p>
            </div>
            <div className="flip-card-face flip-card-face-back flex h-full flex-col items-center justify-center rounded-xl border border-hairline bg-card px-8 text-center">
              <p className="font-display text-2xl font-semibold leading-snug text-ink">{card.vietnameseMeaning}</p>
              {card.englishMeaning && <p className="mt-1 text-sm text-muted">{card.englishMeaning}</p>}
              {card.exampleSentence && (
                <div className="mt-6 w-full border-t border-hairline pt-5">
                  <p className="text-base text-ink">{card.exampleSentence}</p>
                  {card.exampleSentenceVi && <p className="mt-1 text-sm text-muted">{card.exampleSentenceVi}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mode !== 'flip' && (
        <div key={card.id} className="relative rounded-xl border border-hairline bg-card px-5 pb-6 pt-10 sm:px-8">
          <CardTags card={card} />

          <div className="text-center">
            <p className="font-display text-2xl font-semibold leading-snug text-ink">{card.vietnameseMeaning}</p>
            {card.englishMeaning && <p className="mt-1 text-sm text-muted">{card.englishMeaning}</p>}
          </div>

          {display && (
            <div className="mt-6 rounded-lg bg-surface px-4 py-4 text-center text-lg leading-relaxed text-ink">
              {revealed && card.exampleSentence && display.text.includes(BLANK) ? (
                <RevealedSentence sentence={card.exampleSentence} display={display} />
              ) : display.text.includes(BLANK) ? (
                <BlankSentence text={display.text} />
              ) : (
                <QuestionSentence display={display} />
              )}
              {revealed && card.exampleSentenceVi && (
                <p className="mt-2 text-sm text-muted">{card.exampleSentenceVi}</p>
              )}
            </div>
          )}

          {mode === 'fill' && !fillRevealed && (
            <div className="mt-6">
              <p className="mb-2 text-center text-sm text-muted">Gõ từ tiếng Đức còn thiếu, rồi nhấn Enter</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleFillCheck()
                }}
              >
                <input
                  ref={fillInputRef}
                  value={fillInput}
                  onChange={(e) => {
                    setFillInput(e.target.value)
                    setFillWrong(false)
                  }}
                  aria-label="Từ tiếng Đức"
                  aria-invalid={fillWrong}
                  placeholder="Gõ ở đây..."
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  autoFocus
                  className={`h-14 w-full rounded-md border bg-canvas px-4 text-center font-display text-xl text-ink placeholder:font-sans placeholder:text-base placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-3 ${
                    fillWrong ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-hairline focus:border-primary focus:ring-primary/20'
                  }`}
                />
                <div className="mt-2 flex flex-wrap justify-center gap-1.5" role="group" aria-label="Chèn chữ có dấu">
                  {UMLAUT_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => insertFillChar(key)}
                      className="h-8 min-w-8 rounded-sm border border-hairline bg-canvas px-2 text-sm font-medium text-ink transition-colors hover:bg-surface active:translate-y-px"
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <p className="mt-3 min-h-5 text-center text-sm font-medium text-danger" aria-live="polite">
                  {fillWrong ? (fillHint ?? 'Chưa đúng, thử lại nhé.') : ''}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleFillReveal}
                    className="rounded-md border border-hairline bg-canvas px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
                  >
                    Xem đáp án
                  </button>
                  <button
                    type="submit"
                    disabled={!fillInput.trim()}
                    className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-canvas transition-[background,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary-deep hover:shadow-lifted disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
                  >
                    Kiểm tra
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === 'choice' && (
            <div className="mt-6">
              <p className="mb-2 text-center text-sm text-muted">Chọn từ tiếng Đức đúng</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {choices.map((choice, i) => {
                  const isCorrect = choice === card.germanWord
                  const showResult = choiceSelected !== null
                  const stateClass = !showResult
                    ? 'border-hairline bg-canvas hover:-translate-y-px hover:border-ink/30 hover:shadow-lifted'
                    : isCorrect
                      ? 'border-success bg-success-bg text-success'
                      : choice === choiceSelected
                        ? 'border-danger bg-danger-bg text-danger'
                        : 'border-hairline bg-canvas opacity-50'
                  return (
                    <button
                      key={choice}
                      onClick={() => choiceSelected === null && setChoiceSelected(choice)}
                      disabled={choiceSelected !== null}
                      className={`flex items-center gap-3 rounded-md border px-3 py-3 text-left text-base font-medium transition-[transform,box-shadow,border-color] duration-150 ${stateClass}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-current/25 text-xs font-semibold opacity-70">
                        {CHOICE_LETTERS[i]}
                      </span>
                      <span className="min-w-0 flex-1">{choice}</span>
                    </button>
                  )
                })}
              </div>
              {choiceSelected === null && (
                <p className="mt-3 hidden text-center text-xs text-muted sm:block">
                  Phím <Kbd>1</Kbd>-<Kbd>{choices.length}</Kbd> để chọn nhanh
                </p>
              )}
            </div>
          )}

          {revealed && objectiveOutcome !== null && (
            <AnswerFeedback
              card={card}
              outcome={objectiveOutcome}
              firstTryCorrect={mode === 'fill' ? fillCorrect && !fillMistake : objectiveOutcome === 'passed'}
              correctAfterRetry={mode === 'fill' && fillCorrect && fillMistake}
            />
          )}
        </div>
      )}

      {revealed && (
        <div className="mt-5">
          {objectiveOutcome === 'failed' && (
            <p className="mb-2 text-center text-sm text-muted">Chưa nhớ ra ngay lần đầu, từ này sẽ quay lại sớm để ôn.</p>
          )}
          {objectiveOutcome === null && (
            <p className="mb-2 text-center text-sm text-muted">Bạn nhớ từ này đến đâu?</p>
          )}
          <div className={`grid gap-2 ${availableRatings.length === 3 ? 'grid-cols-3' : availableRatings.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {availableRatings.map((r, i) => {
              const primary = i === availableRatings.length - 1
              const label = objectiveOutcome === 'failed' ? 'Tiếp tục' : r.label
              return (
                <button
                  key={r.quality}
                  ref={primary ? nextButtonRef : undefined}
                  onClick={() => handleAnswer(r.quality)}
                  disabled={submitting}
                  className={`flex flex-col items-center rounded-md px-3 py-3 transition-[background,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 ${
                    primary
                      ? 'bg-primary text-canvas hover:-translate-y-px hover:bg-primary-deep hover:shadow-lifted'
                      : 'border border-hairline bg-canvas text-ink hover:bg-surface'
                  }`}
                >
                  <span className={`text-base font-semibold ${r.quality === 'FORGOT' && !primary ? 'text-danger' : ''}`}>
                    {label}
                    <span className="hidden sm:inline">
                      <Kbd className={`ml-2 ${primary ? 'border-canvas/30 text-canvas/70' : ''}`}>{r.key}</Kbd>
                    </span>
                  </span>
                  {objectiveOutcome !== 'failed' && (
                    <span className={`mt-0.5 text-xs ${primary ? 'text-canvas/70' : 'text-muted'}`}>{r.hint}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------------------------------

function CardTags({ card }: { card: VocabularyItem }) {
  return (
    <div className="absolute inset-x-4 top-3.5 flex items-center justify-between gap-2 text-xs text-muted">
      <span>{card.wordType ?? ''}</span>
      {card.level && <span className="rounded-full border border-hairline px-2 py-0.5 font-medium">{card.level}</span>}
    </div>
  )
}

function SpeakButton({ word, className = '' }: { word: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speak(spokenForm(word))
      }}
      aria-label="Nghe phát âm"
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-canvas text-ink transition-colors hover:bg-surface ${className}`}
    >
      <SpeakerIcon className="h-5 w-5" />
    </button>
  )
}

function Kbd({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={`inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-hairline px-1 font-sans text-xs font-medium leading-none text-muted ${className}`}>
      {children}
    </kbd>
  )
}

/** Câu ví dụ có chỗ trống: "_____" vẽ thành một ô gạch chân thay vì dãy gạch dưới. */
function BlankSentence({ text }: { text: string }) {
  const parts = text.split(BLANK)
  return (
    <p>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="mx-0.5 inline-block w-20 translate-y-1 border-b-2 border-ink/50 align-baseline" aria-label="chỗ trống" />
          )}
        </span>
      ))}
    </p>
  )
}

/** Sau khi lộ đáp án: điền lại câu gốc, tô đậm đúng chữ đã bị đục. */
function RevealedSentence({ sentence, display }: { sentence: string; display: QuestionDisplay }) {
  const at = display.text.indexOf(BLANK)
  const length = sentence.length - (display.text.length - BLANK.length)
  if (at < 0 || length <= 0) return <p>{sentence}</p>
  return (
    <p>
      {sentence.slice(0, at)}
      <span className="font-semibold underline decoration-2 underline-offset-4">{sentence.slice(at, at + length)}</span>
      {sentence.slice(at + length)}
    </p>
  )
}

function AnswerFeedback({
  card,
  outcome,
  firstTryCorrect,
  correctAfterRetry,
}: {
  card: VocabularyItem
  outcome: 'passed' | 'failed'
  firstTryCorrect: boolean
  correctAfterRetry: boolean
}) {
  const title = firstTryCorrect ? 'Chính xác!' : correctAfterRetry ? 'Đúng rồi, nhưng chưa đúng ngay lần đầu' : 'Đáp án đúng'
  const good = outcome === 'passed'
  return (
    <div
      className={`mt-5 flex items-center gap-3 rounded-lg px-4 py-3 ${good ? 'bg-success-bg' : 'bg-danger-bg'}`}
      role="status"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${good ? 'bg-accent text-ink' : 'bg-danger text-canvas'}`}
        aria-hidden="true"
      >
        {good ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M7 7l10 10M17 7L7 17" />
          </svg>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${good ? 'text-success' : 'text-danger'}`}>{title}</p>
        <p className="font-display text-lg font-semibold text-ink">
          <GermanWord item={card} />
          {card.phonetic && <span className="ml-2 font-sans text-sm font-normal text-muted">[{card.phonetic}]</span>}
        </p>
        <PluralLine plural={card.plural} className="block text-xs text-muted" />
      </div>
      <SpeakButton word={card.germanWord} />
    </div>
  )
}

function SessionSummary({ reviewed, tally }: { reviewed: number; tally: Record<ReviewQuality, number> }) {
  const rows: { label: string; value: number; className: string }[] = [
    { label: 'Dễ', value: tally.EASY, className: 'text-ink' },
    { label: 'Nhớ', value: tally.REMEMBERED, className: 'text-ink' },
    { label: 'Quên', value: tally.FORGOT, className: 'text-danger' },
  ]
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-hairline bg-card px-6 py-8 text-center">
      {/* Hoàn thành phiên ôn là "khoảnh khắc đạt được" nên được dùng màu amber (DESIGN.md). */}
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-ink" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <p className="mt-4 font-display text-xl font-semibold text-ink">Xong phiên ôn tập</p>
      <p className="mt-1 text-sm text-muted">Bạn đã ôn {reviewed} thẻ. Từng bước một, không cần vội.</p>
      <dl className="mx-auto mt-5 grid max-w-xs grid-cols-3 divide-x divide-hairline rounded-lg bg-surface py-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dd className={`font-display text-2xl font-semibold ${r.className}`}>{r.value}</dd>
            <dt className="text-xs text-muted">{r.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  )
}
