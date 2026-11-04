import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnswerOption, Button, QuestionNav, cn, type AnswerState } from '@kit'
import type { VocabularyItem } from '../../api/types'
import { shuffle } from '../../lib/quiz'

const MIN_ROUND_COUNT = 20

type Tile = { key: string; id: number; text: string; side: 'left' | 'right' }

// Deals rounds from a shuffled deck instead of drawing each round independently at random --
// independent draws can (and with few pairs per round, will) skip some words entirely purely by
// bad luck, since nothing stops the same handful of words from being picked over and over. Once
// the deck runs low, it's replenished with a fresh shuffled pass, so every word is guaranteed to
// reappear before any word repeats a second time within a pass.
function dealRounds(items: VocabularyItem[], pairsPerRound: number, roundCount: number) {
  const rounds: VocabularyItem[][] = []
  let deck: VocabularyItem[] = []
  for (let i = 0; i < roundCount; i++) {
    if (deck.length < pairsPerRound) deck = [...deck, ...shuffle(items)]
    rounds.push(deck.splice(0, pairsPerRound))
  }
  return rounds
}

/**
 * Chế độ nối từ CỐ Ý không ghi kết quả vào lịch ôn SM-2, khác với 5 chế độ còn lại. Tín hiệu của
 * nó không đáng tin theo cả hai chiều:
 *  - Nối SAI thì có hai từ dính vào, mà không biết người học không biết từ nào. Ghi "quên" cho cả
 *    hai là kéo lùi lịch ôn của một từ có thể đã nhớ.
 *  - Nối ĐÚNG không chứng minh được gì cho mấy cặp cuối mỗi vòng — còn ít ô thì ghép đúng nhờ loại
 *    trừ, không cần biết nghĩa.
 * Đây là trò khởi động để làm quen mặt chữ, không phải phép đo trí nhớ.
 */
export default function MatchingExercise({
  items,
  onComplete,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
}) {
  // Fewer pairs per round on phones -- 8 pairs (16 tiles) in a 2-column grid runs to 8 rows tall
  // on a narrow screen, which is a lot of scrolling and visual noise for one round. Read once at
  // mount (matches how `rounds`/`tiles` below are also lazily computed only on first render).
  const pairsPerRound = Math.min(window.matchMedia('(max-width: 639px)').matches ? 2 : 8, items.length)
  // More, smaller rounds on mobile so the total pairs shown (roundCount * pairsPerRound) still
  // covers every word at least once -- otherwise a 50-word lesson at 2 pairs/round would run out
  // after just 40 of them across the fixed 20 rounds, silently never showing the rest.
  const roundCount = Math.max(MIN_ROUND_COUNT, Math.ceil(items.length / pairsPerRound))

  const [rounds] = useState(() => dealRounds(items, pairsPerRound, roundCount))
  const [roundIndex, setRoundIndex] = useState(0)
  const [matchedByRound, setMatchedByRound] = useState<Record<number, Set<number>>>({})
  const [fadingByRound, setFadingByRound] = useState<Record<number, Set<number>>>({})
  const [selected, setSelected] = useState<{ id: number; side: 'left' | 'right' } | null>(null)
  const [wrong, setWrong] = useState<{ id: number; side: 'left' | 'right' }[] | null>(null)

  const matched = matchedByRound[roundIndex] ?? new Set<number>()
  const fading = fadingByRound[roundIndex] ?? new Set<number>()

  const [tiles] = useState<Tile[][]>(() =>
    rounds.map((pairs) =>
      shuffle([
        ...pairs.map((p) => ({ key: `${p.id}-left`, id: p.id, text: p.germanWord, side: 'left' as const })),
        ...pairs.map((p) => ({ key: `${p.id}-right`, id: p.id, text: p.vietnameseMeaning, side: 'right' as const })),
      ])
    )
  )

  const completedRounds = rounds.filter((pairs, i) => (matchedByRound[i]?.size ?? 0) === pairs.length).length
  const finished = pairsPerRound >= 2 && completedRounds === roundCount

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  if (pairsPerRound < 2) {
    return <p className="text-radiert">Cần ít nhất 2 từ trong bài học để luyện dạng này.</p>
  }

  function clickTile(tile: Tile) {
    if (matched.has(tile.id) || wrong) return

    if (!selected) {
      setSelected({ id: tile.id, side: tile.side })
      return
    }

    if (selected.side === tile.side) {
      setSelected({ id: tile.id, side: tile.side })
      return
    }

    if (selected.id === tile.id) {
      const matchedId = tile.id
      const matchedRound = roundIndex
      setMatchedByRound((prev) => {
        const next = new Set(prev[roundIndex] ?? [])
        next.add(tile.id)
        if (next.size === pairsPerRound && roundIndex < roundCount - 1) {
          setTimeout(() => {
            setRoundIndex((i) => Math.min(roundCount - 1, i + 1))
            setSelected(null)
          }, 900)
        }
        return { ...prev, [roundIndex]: next }
      })
      setSelected(null)
      // Let the "correct" highlight register first, then fade+shrink the tile
      // in place (its grid cell stays put, no reflow) to draw focus elsewhere.
      setTimeout(() => {
        setFadingByRound((prev) => {
          const next = new Set(prev[matchedRound] ?? [])
          next.add(matchedId)
          return { ...prev, [matchedRound]: next }
        })
      }, 400)
      return
    }

    setWrong([selected, { id: tile.id, side: tile.side }])
    setTimeout(() => {
      setWrong(null)
      setSelected(null)
    }, 600)
  }

  function tileState(tile: Tile): AnswerState {
    if (matched.has(tile.id)) return 'correct'
    if (wrong?.some((w) => w.id === tile.id && w.side === tile.side)) return 'wrong'
    if (selected?.id === tile.id && selected.side === tile.side) return 'selected'
    return 'idle'
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button variant="secondary" size="sm" icon={<ArrowLeft className="size-4" aria-hidden="true" />}
          onClick={() => { setRoundIndex((i) => Math.max(0, i - 1)); setSelected(null) }} disabled={roundIndex === 0}>
          Vòng trước
        </Button>
        <p className="text-sm text-radiert">
          Đã hoàn thành {completedRounds}/{roundCount} vòng
        </p>
        <Button variant="secondary" size="sm" disabled={roundIndex === roundCount - 1}
          onClick={() => { setRoundIndex((i) => Math.min(roundCount - 1, i + 1)); setSelected(null) }}>
          Vòng sau
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {tiles[roundIndex].map((tile) => (
          <AnswerOption key={tile.key} state={tileState(tile)} onClick={() => clickTile(tile)} disabled={matched.has(tile.id)}
            className={cn('flex min-h-28 items-center justify-center p-5 text-center text-base transition-all duration-300 ease-out',
              tile.side === 'left' ? 'font-display font-semibold' : 'font-normal',
              matched.has(tile.id) && 'opacity-60', fading.has(tile.id) && 'scale-75 opacity-0')}>
            {tile.text}
          </AnswerOption>
        ))}
      </div>

      <p className="mb-2 font-medium text-bleistift">Danh sách vòng:</p>
      <QuestionNav label="Danh sách vòng" current={roundIndex} onSelect={(i) => { setRoundIndex(i); setSelected(null) }}
        marks={rounds.map((pairs, i) => ((matchedByRound[i]?.size ?? 0) === pairs.length ? 'correct' : 'open'))} />
    </div>
  )
}
