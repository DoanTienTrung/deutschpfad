import { useEffect, useMemo, useRef, useState } from 'react'
import type { DeckItem } from '../../api/types'
import { buildChoices, questionDisplay, shuffle } from '../../lib/quiz'
import { isCorrectAnswer } from '../../lib/answer'
import { speak } from '../../lib/speech'
import Button from '../ui/Button'
import Field from '../ui/Field'
import SpeakerIcon from '../ui/SpeakerIcon'
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
    return <p className="text-muted">Bộ từ này chưa có từ nào.</p>
  }

  if (finished) {
    return (
      <p className="text-center font-display text-lg font-semibold text-ink">
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

  function handleFillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
      <p className="mb-4 text-center text-sm text-muted">
        Thẻ {index + 1}/{order.length}
      </p>

      {mode === 'flip' && (
        <div
          onClick={() => setFlipped((f) => !f)}
          className="flip-card h-64 cursor-pointer"
        >
          <div className={`flip-card-inner h-full ${flipped ? 'is-flipped' : ''}`}>
            <div className="flip-card-face flex h-full flex-col items-center justify-center rounded-lg bg-surface p-8 text-center shadow-lifted">
              <p className="font-display text-3xl font-semibold text-ink">{card.germanWord}</p>
              {card.phonetic && <p className="mt-1 text-base text-muted">[{card.phonetic}]</p>}
              {card.wordType && <p className="mt-2 text-sm text-muted">[{card.wordType}]</p>}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  speak(card.germanWord)
                }}
                className="mt-4 text-primary hover:text-primary-deep"
                aria-label="Phát âm"
              >
                <SpeakerIcon className="h-7 w-7" />
              </button>
              <p className="mt-6 text-xs text-muted">Bấm để xem nghĩa</p>
            </div>
            <div className="flip-card-face flip-card-face-back flex h-full flex-col items-center justify-center overflow-y-auto rounded-lg bg-surface p-8 text-center shadow-lifted">
              <p className="font-display text-2xl font-semibold text-ink">{card.vietnameseMeaning}</p>
              {card.englishMeaning && <p className="mt-1 text-sm text-muted">{card.englishMeaning}</p>}
              {card.exampleSentence && <p className="mt-4 text-sm italic text-muted">{card.exampleSentence}</p>}
              {(card.synonyms || card.antonyms) && (
                <p className="mt-3 text-xs text-muted">
                  {card.synonyms && <>Đồng nghĩa: {card.synonyms}</>}
                  {card.synonyms && card.antonyms && ' · '}
                  {card.antonyms && <>Trái nghĩa: {card.antonyms}</>}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {mode !== 'flip' && (
        <div className="rounded-lg bg-surface p-6 shadow-lifted">
          <div className="mb-4 text-center">
            {card.wordType && <p className="text-xs font-medium uppercase text-muted">{card.wordType}</p>}
            <p className="mt-1 text-xl font-bold text-ink">{card.vietnameseMeaning}</p>
            {card.englishMeaning && <p className="mt-1 text-sm italic text-muted">= {card.englishMeaning}</p>}
          </div>

          {display && <QuestionSentence display={display} className="mb-4 text-center text-base text-ink" />}

          {mode === 'fill' && (
            <>
              <Field
                ref={fillInputRef}
                id="deck-fill-answer"
                label="Điền từ tiếng Đức, rồi nhấn Enter"
                value={fillInput}
                onChange={(e) => {
                  setFillInput(e.target.value)
                  setFillWrong(false)
                }}
                onKeyDown={handleFillKeyDown}
                autoComplete="off"
                autoFocus
                readOnly={fillRevealed}
                status={fillRevealed ? (fillCorrect ? 'success' : 'error') : fillWrong ? 'error' : 'default'}
              />
              {!fillRevealed && (
                <>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-xs text-muted">Không gõ được dấu?</span>
                    {UMLAUT_KEYS.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => insertFillChar(key)}
                        className="rounded-sm border border-hairline px-2.5 py-1 text-sm font-medium text-ink hover:bg-surface"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleFillReveal}
                      className="rounded-full border border-hairline px-6 py-2 text-sm font-medium text-ink hover:bg-surface"
                    >
                      👀 Hiện đáp án
                    </button>
                  </div>
                  {fillWrong && (
                    <p className="mt-3 text-center text-sm font-medium text-danger">Chưa đúng, thử lại nhé.</p>
                  )}
                </>
              )}
              {fillRevealed && (
                <p className={`mt-3 text-center text-sm font-medium ${fillCorrect ? 'text-success' : 'text-danger'}`}>
                  {fillCorrect ? 'Chính xác!' : `Đáp án: "${card.germanWord}"`}
                </p>
              )}
            </>
          )}

          {mode === 'choice' && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {choices.map((choice) => {
                const isCorrect = choice === card.germanWord
                const showResult = choiceSelected !== null
                const stateClass = !showResult
                  ? 'border-hairline hover:bg-surface'
                  : isCorrect
                    ? 'border-success bg-success-bg text-success'
                    : choice === choiceSelected
                      ? 'border-danger bg-danger-bg text-danger'
                      : 'border-hairline opacity-50'
                return (
                  <button
                    key={choice}
                    onClick={() => choiceSelected === null && setChoiceSelected(choice)}
                    disabled={choiceSelected !== null}
                    className={`rounded-sm border px-4 py-3 text-center text-sm font-medium ${stateClass}`}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {revealed && (
        <div className="mt-6">
          <Button onClick={handleNext}>Tiếp tục →</Button>
        </div>
      )}
    </div>
  )
}
