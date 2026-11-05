import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, Volume2, X } from 'lucide-react'
import { AnswerOption, Badge, Button, Card, IconButton, Input, Note, ProgressBar, cn, type AnswerState } from '@kit'
import { submitReview } from '../../api/vocabularyApi'
import type { VocabularyItem, ReviewQuality } from '../../api/types'
import { buildChoices, questionDisplay, shuffle, type QuestionDisplay } from '../../lib/quiz'
import { checkAnswer, spokenForm } from '../../lib/answer'
import { speak } from '../../lib/speech'
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
        // Chỉ còn một nút (trả lời sai thì chỉ có "Tiếp tục"): Enter cũng sang thẻ tiếp.
        if (e.key === 'Enter' && availableRatings.length === 1 && !onButton) {
          handleAnswer(availableRatings[0].quality)
          return
        }
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

  return (
    <div className="mx-auto max-w-xl">
      {/* Tiến độ phiên */}
      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium text-bleistift">
            Thẻ {index + 1} <span className="font-normal text-radiert">/ {order.length}</span>
          </span>
          <span className="text-xs font-medium text-radiert">{MODE_LABEL[mode]}</span>
        </div>
        <ProgressBar value={index / order.length} label="Tiến độ phiên ôn" />
      </div>

      {error && (
        <Note tone="bad" className="mb-4">{error}</Note>
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
            <div className="flip-card-face relative flex h-full flex-col items-center justify-center rounded-karte border border-kartenrand bg-karteikarte lampenlicht px-8 text-center shadow-lift">
              <CardTags card={card} />
              <p className="font-display text-4xl font-semibold leading-tight text-bleistift">
                <GermanWord item={card} />
              </p>
              <PluralLine plural={card.plural} className="mt-2 block text-sm text-radiert" />
              {card.phonetic && <p className="mt-1 text-sm text-radiert">[{card.phonetic}]</p>}
              <SpeakButton word={card.germanWord} className="mt-5" />
              <p className="absolute inset-x-0 bottom-5 text-xs text-radiert">
                Chạm để lật thẻ
                <span className="hidden sm:inline">
                  {' '}
                  <Kbd className="ml-1">Space</Kbd>
                </span>
              </p>
            </div>
            <div className="flip-card-face flip-card-face-back flex h-full flex-col items-center justify-center rounded-karte border border-kartenrand bg-karteikarte textur-linien px-8 text-center shadow-lift">
              <p className="font-display text-2xl font-semibold leading-snug text-bleistift">{card.vietnameseMeaning}</p>
              {card.englishMeaning && <p className="mt-1 text-sm text-radiert">{card.englishMeaning}</p>}
              {card.exampleSentence && (
                <div className="mt-6 w-full border-t border-linie pt-5">
                  <p className="text-base text-bleistift">{card.exampleSentence}</p>
                  {card.exampleSentenceVi && <p className="mt-1 text-sm text-radiert">{card.exampleSentenceVi}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mode !== 'flip' && (
        <Card key={card.id} className="relative px-5 pt-10 pb-6 sm:px-8">
          <CardTags card={card} />

          <div className="text-center">
            <p className="font-display text-2xl font-semibold leading-snug text-bleistift">{card.vietnameseMeaning}</p>
            {card.englishMeaning && <p className="mt-1 text-sm text-radiert">{card.englishMeaning}</p>}
          </div>

          {display && (
            <div className="mt-6 rounded-karte border border-linie bg-karteikarte-innen px-4 py-4 text-center text-lg leading-relaxed text-bleistift">
              {revealed && card.exampleSentence && display.text.includes(BLANK) ? (
                <RevealedSentence sentence={card.exampleSentence} display={display} />
              ) : display.text.includes(BLANK) ? (
                <BlankSentence text={display.text} />
              ) : (
                <QuestionSentence display={display} />
              )}
              {revealed && card.exampleSentenceVi && (
                <p className="mt-2 text-sm text-radiert">{card.exampleSentenceVi}</p>
              )}
            </div>
          )}

          {mode === 'fill' && !fillRevealed && (
            <div className="mt-6">
              <p className="mb-2 text-center text-sm text-radiert">Gõ từ tiếng Đức còn thiếu, rồi nhấn Enter</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleFillCheck()
                }}
              >
                <Input ref={fillInputRef} value={fillInput}
                  onChange={(e) => { setFillInput(e.target.value); setFillWrong(false) }}
                  aria-label="Từ tiếng Đức" invalid={fillWrong} placeholder="Gõ ở đây..."
                  autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} autoFocus
                  className="h-14 text-center font-display text-xl placeholder:font-sans placeholder:text-base" />
                <div className="mt-2 flex flex-wrap justify-center gap-1.5" role="group" aria-label="Chèn chữ có dấu">
                  {UMLAUT_KEYS.map((key) => (
                    <Button key={key} variant="secondary" size="sm" onClick={() => insertFillChar(key)} aria-label={`Thêm chữ ${key}`}>
                      {key}
                    </Button>
                  ))}
                </div>

                <p className="mt-3 min-h-5 text-center text-sm font-medium text-rotstift" aria-live="polite">
                  {fillWrong ? (fillHint ?? 'Chưa đúng, thử lại nhé.') : ''}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={handleFillReveal}>Xem đáp án</Button>
                  <Button type="submit" disabled={!fillInput.trim()}>Kiểm tra</Button>
                </div>
              </form>
            </div>
          )}

          {mode === 'choice' && (
            <div className="mt-6">
              <p className="mb-2 text-center text-sm text-radiert">Chọn từ tiếng Đức đúng</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {choices.map((choice, i) => {
                  const isCorrect = choice === card.germanWord
                  const state: AnswerState = choiceSelected === null ? 'idle' : isCorrect ? 'correct' : choice === choiceSelected ? 'wrong' : 'dim'
                  return (
                    <AnswerOption key={choice} state={state} onClick={() => choiceSelected === null && setChoiceSelected(choice)}
                      disabled={choiceSelected !== null} className="flex items-center gap-3 px-3 text-left text-base font-medium">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-karte border border-current/25 text-xs font-semibold opacity-70">
                        {CHOICE_LETTERS[i]}
                      </span>
                      <span className="min-w-0 flex-1">{choice}</span>
                    </AnswerOption>
                  )
                })}
              </div>
              {choiceSelected === null && (
                <p className="mt-3 hidden text-center text-xs text-radiert sm:block">
                  Phím <Kbd>1</Kbd>-<Kbd>{choices.length}</Kbd> để chọn nhanh
                </p>
              )}
            </div>
          )}

          {revealed && objectiveOutcome !== null && (
            <WordFeedback
              card={card}
              outcome={objectiveOutcome}
              firstTryCorrect={mode === 'fill' ? fillCorrect && !fillMistake : objectiveOutcome === 'passed'}
              correctAfterRetry={mode === 'fill' && fillCorrect && fillMistake}
            />
          )}
        </Card>
      )}

      {revealed && (
        <div className="mt-5">
          {objectiveOutcome === 'failed' && (
            <p className="mb-2 text-center text-sm text-radiert">Chưa nhớ ra ngay lần đầu, từ này sẽ quay lại sớm để ôn.</p>
          )}
          {objectiveOutcome === null && (
            <p className="mb-2 text-center text-sm text-radiert">Bạn nhớ từ này đến đâu?</p>
          )}
          <div className={cn('grid gap-2', availableRatings.length === 3 ? 'grid-cols-3' : availableRatings.length === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
            {availableRatings.map((r, i) => {
              const primary = i === availableRatings.length - 1
              const label = objectiveOutcome === 'failed' ? 'Tiếp tục' : r.label
              // Phím tắt hiện cạnh nhãn (chỉ trên máy tính). Nút "Tiếp tục" duy nhất thì gợi ý Enter cho dễ hiểu.
              const shortcut = objectiveOutcome === 'failed' ? 'Enter' : r.key
              return (
                <Button key={r.quality} ref={primary ? nextButtonRef : undefined} onClick={() => handleAnswer(r.quality)} disabled={submitting}
                  variant={primary ? 'primary' : 'secondary'} className="h-auto flex-col gap-0 px-3 py-3">
                  <span className={cn('text-base font-semibold', r.quality === 'FORGOT' && !primary && 'text-rotstift')}>
                    {label}
                    <span className="hidden sm:inline">
                      <Kbd className={cn('ml-2', primary && 'border-bleistift-invers/50 text-bleistift-invers')}
                        title={`Phím tắt: bấm ${shortcut} trên bàn phím`}>{shortcut}</Kbd>
                    </span>
                  </span>
                  {objectiveOutcome !== 'failed' && (
                    <span className={cn('mt-0.5 text-xs font-normal', primary ? 'text-bleistift-invers/70' : 'text-radiert')}>{r.hint}</span>
                  )}
                </Button>
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
    <div className="absolute inset-x-4 top-3.5 flex items-center justify-between gap-2 text-xs text-radiert">
      <span>{card.wordType ?? ''}</span>
      {card.level && <Badge>{card.level}</Badge>}
    </div>
  )
}

function SpeakButton({ word, className }: { word: string; className?: string }) {
  // Nằm trong thẻ lật (cả thẻ bấm được): chặn sự kiện để bấm loa không lật thẻ.
  return (
    <IconButton variant="secondary" label="Nghe phát âm" icon={<Volume2 className="size-5" aria-hidden="true" />} className={cn('rounded-rund', className)}
      onClick={(e) => { e.stopPropagation(); speak(spokenForm(word)) }} />
  )
}

function Kbd({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <kbd title={title} className={cn('inline-flex h-5 min-w-5 items-center justify-center rounded-karte border border-kante px-1 font-sans text-xs leading-none font-medium text-radiert', className)}>
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
            <span className="mx-0.5 inline-block w-20 translate-y-1 border-b-2 border-bleistift/50 align-baseline" aria-label="chỗ trống" />
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

function WordFeedback({
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
      className={cn('mt-5 flex items-center gap-3 rounded-karte border px-4 py-3', good ? 'border-aufstieg/50 bg-aufstieg-soft animate-richtig' : 'border-rotstift/50 bg-rotstift-soft animate-falsch')}
      role="status"
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-rund text-bleistift-invers', good ? 'bg-aufstieg' : 'bg-rotstift')} aria-hidden="true">
        {good ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${good ? 'text-aufstieg' : 'text-rotstift'}`}>{title}</p>
        <p className="font-display text-lg font-semibold text-bleistift">
          <GermanWord item={card} />
          {card.phonetic && <span className="ml-2 font-sans text-sm font-normal text-radiert">[{card.phonetic}]</span>}
        </p>
        <PluralLine plural={card.plural} className="block text-xs text-radiert" />
      </div>
      <SpeakButton word={card.germanWord} />
    </div>
  )
}

function SessionSummary({ reviewed, tally }: { reviewed: number; tally: Record<ReviewQuality, number> }) {
  const rows: { label: string; value: number; className: string }[] = [
    { label: 'Dễ', value: tally.EASY, className: 'text-bleistift' },
    { label: 'Nhớ', value: tally.REMEMBERED, className: 'text-bleistift' },
    { label: 'Quên', value: tally.FORGOT, className: 'text-rotstift' },
  ]
  return (
    <Card className="mx-auto max-w-xl px-6 py-8 text-center">
      {/* Hoàn thành phiên ôn là "khoảnh khắc đạt được" nên được dùng hổ phách (DESIGN.md). */}
      <span className="mx-auto flex size-12 items-center justify-center rounded-rund bg-reiter text-reiter-beschriftung animate-stempel" aria-hidden="true">
        <Check className="size-6" strokeWidth={2.6} />
      </span>
      <p className="mt-4 font-display text-xl font-semibold text-bleistift">Xong phiên ôn tập</p>
      <p className="mt-1 text-sm text-radiert">Bạn đã ôn {reviewed} thẻ. Từng bước một, không cần vội.</p>
      <dl className="mx-auto mt-5 grid max-w-xs grid-cols-3 divide-x divide-linie rounded-karte border border-linie bg-karteikarte-innen py-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dd className={`font-display text-2xl font-semibold ${r.className}`}>{r.value}</dd>
            <dt className="text-xs text-radiert">{r.label}</dt>
          </div>
        ))}
      </dl>
    </Card>
  )
}
