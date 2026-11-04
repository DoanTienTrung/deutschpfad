import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, Eye, Volume2 } from 'lucide-react'
import { AnswerFeedback, AnswerOption, Button, Card, Field, Input, ReviewCard, type AnswerState } from '@kit'
import type { DeckItem } from '../../api/types'
import { buildChoices, questionDisplay, shuffle } from '../../lib/quiz'
import { isCorrectAnswer, spokenForm } from '../../lib/answer'
import { speak } from '../../lib/speech'
import QuestionSentence from './QuestionSentence'

const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

// Lightweight practice for user-created decks: same flip/fill/choice card variety as the
// SM2-backed lesson flashcards, but deck items live in a separate table (user_deck_items) with
// no vocabulary_item_id — so there's nothing to submit a spaced-repetition review against. This
// is a plain flip-through session (a "Tiếp tục" button instead of Quên/Nhớ/Dễ), no persistence.
type CardMode = 'flip' | 'fill' | 'choice'

function hasBlankSentence(item: DeckItem): boolean {
  const display = questionDisplay({ ...item, exampleSentenceHighlight: null })
  return display !== null && display.text.includes('_____')
}

export default function DeckFlashcardExercise({ items, onComplete }: { items: DeckItem[]; onComplete?: () => void }) {
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
  const [choiceSelected, setChoiceSelected] = useState<string | null>(null)
  const fillInputRef = useRef<HTMLInputElement | null>(null)

  const finished = index >= order.length
  const mode = cardModes[index]

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  const choices = useMemo(() => {
    const item = order[index]
    if (!item || mode !== 'choice') return []
    return buildChoices(item.germanWord, items.map((i) => i.germanWord))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-shuffle choices only when moving to a different card
  }, [index])

  if (items.length === 0) {
    return <p className="text-radiert">Bộ từ này chưa có từ nào.</p>
  }

  if (finished) {
    return (
      <p className="text-center font-display text-lg font-semibold text-bleistift">
        Hoàn thành! Đã ôn {order.length} từ.
      </p>
    )
  }

  const card = order[index]
  const revealed = mode === 'flip' ? flipped : mode === 'fill' ? fillRevealed : choiceSelected !== null
  const display = questionDisplay({ ...card, exampleSentenceHighlight: null })

  function resetCardState() {
    setFlipped(false)
    setFillInput('')
    setFillRevealed(false)
    setFillCorrect(false)
    setFillWrong(false)
    setChoiceSelected(null)
  }

  function handleNext() {
    resetCardState()
    setIndex((i) => i + 1)
  }

  function insertFillChar(char: string) {
    const el = fillInputRef.current
    const start = el?.selectionStart ?? fillInput.length
    const end = el?.selectionEnd ?? fillInput.length
    const next = fillInput.slice(0, start) + char + fillInput.slice(end)
    setFillInput(next)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + char.length, start + char.length)
    })
  }

  function handleFillReveal() {
    setFillCorrect(false)
    setFillWrong(false)
    setFillRevealed(true)
    setFillInput(card.germanWord)
  }

  function handleFillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || fillRevealed || !fillInput.trim()) return
    if (isCorrectAnswer(fillInput, card.germanWord)) {
      setFillCorrect(true)
      setFillWrong(false)
      setFillRevealed(true)
    } else {
      setFillWrong(true)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-4 text-center text-sm text-radiert">
        Thẻ {index + 1}/{order.length}
      </p>

      {mode === 'flip' && (
        <>
          <ReviewCard flipped={flipped} onFlip={() => setFlipped((f) => !f)} label={flipped ? 'Lật về mặt trước' : 'Lật thẻ xem nghĩa'}
            front={(
              <>
                <span className="font-display text-3xl font-semibold text-bleistift">{card.germanWord}</span>
                {card.phonetic && <span className="mt-1 text-base text-radiert">[{card.phonetic}]</span>}
                {card.wordType && <span className="mt-2 text-sm text-radiert">[{card.wordType}]</span>}
                <span className="mt-6 text-xs text-hauch">Bấm để xem nghĩa</span>
              </>
            )}
            back={(
              <>
                <span className="font-display text-2xl font-semibold text-bleistift">{card.vietnameseMeaning}</span>
                {card.englishMeaning && <span className="mt-1 text-sm text-radiert">{card.englishMeaning}</span>}
                {card.exampleSentence && <span className="mt-4 text-sm text-radiert italic">{card.exampleSentence}</span>}
                {(card.synonyms || card.antonyms) && (
                  <span className="mt-3 text-xs text-radiert">
                    {card.synonyms && <>Đồng nghĩa: {card.synonyms}</>}
                    {card.synonyms && card.antonyms && ' · '}
                    {card.antonyms && <>Trái nghĩa: {card.antonyms}</>}
                  </span>
                )}
              </>
            )} />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" size="sm" icon={<Volume2 className="size-4" aria-hidden="true" />} onClick={() => speak(spokenForm(card.germanWord))}>
              Phát âm
            </Button>
          </div>
        </>
      )}

      {mode !== 'flip' && (
        <Card className="p-6">
          <div className="mb-4 text-center">
            {card.wordType && <p className="text-xs font-medium uppercase text-radiert">{card.wordType}</p>}
            <p className="mt-1 text-xl font-bold text-bleistift">{card.vietnameseMeaning}</p>
            {card.englishMeaning && <p className="mt-1 text-sm italic text-radiert">= {card.englishMeaning}</p>}
          </div>

          {display && <QuestionSentence display={display} className="mb-4 text-center text-base text-bleistift" />}

          {mode === 'fill' && (
            <>
              <Field label="Điền từ tiếng Đức, rồi nhấn Enter">
                <Input ref={fillInputRef} value={fillInput} onChange={(e) => { setFillInput(e.target.value); setFillWrong(false) }}
                  onKeyDown={handleFillKeyDown} autoComplete="off" autoFocus readOnly={fillRevealed}
                  invalid={fillWrong || (fillRevealed && !fillCorrect)} className={fillRevealed && fillCorrect ? 'border-aufstieg' : undefined} />
              </Field>
              {!fillRevealed && (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-xs text-radiert">Không gõ được dấu?</span>
                    {UMLAUT_KEYS.map((key) => (
                      <Button key={key} variant="secondary" size="sm" onClick={() => insertFillChar(key)} aria-label={`Thêm chữ ${key}`}>
                        {key}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button variant="secondary" onClick={handleFillReveal} icon={<Eye className="size-4" aria-hidden="true" />}>
                      Hiện đáp án
                    </Button>
                  </div>
                  {fillWrong && (
                    <AnswerFeedback correct={false} className="mt-3" title="Chưa đúng, thử lại nhé." />
                  )}
                </>
              )}
              {fillRevealed && (
                <AnswerFeedback correct={fillCorrect} className="mt-3" title={fillCorrect ? 'Chính xác.' : `Đáp án: "${card.germanWord}"`} />
              )}
            </>
          )}

          {mode === 'choice' && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {choices.map((choice) => {
                const isCorrect = choice === card.germanWord
                const state: AnswerState = choiceSelected === null ? 'idle' : isCorrect ? 'correct' : choice === choiceSelected ? 'wrong' : 'dim'
                return (
                  <AnswerOption key={choice} state={state} onClick={() => choiceSelected === null && setChoiceSelected(choice)}
                    disabled={choiceSelected !== null} className="text-sm">
                    {choice}
                  </AnswerOption>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {revealed && (
        <div className="mt-6">
          <Button onClick={handleNext} className="w-full">
            Tiếp tục
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  )
}
