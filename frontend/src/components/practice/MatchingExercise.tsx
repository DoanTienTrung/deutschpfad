import { useEffect, useState } from 'react'
import type { VocabularyItem } from '../../api/types'
import { shuffle } from '../../lib/quiz'

const ROUND_COUNT = 20

type Tile = { key: string; id: number; text: string; side: 'left' | 'right' }

export default function MatchingExercise({
  items,
  onComplete,
}: {
  items: VocabularyItem[]
  onComplete?: () => void
}) {
  const pairsPerRound = Math.min(8, items.length)

  const [rounds] = useState(() =>
    Array.from({ length: ROUND_COUNT }, () => shuffle(items).slice(0, pairsPerRound))
  )
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
  const finished = pairsPerRound >= 2 && completedRounds === ROUND_COUNT

  useEffect(() => {
    if (finished) onComplete?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notify exactly once when finished flips to true
  }, [finished])

  if (pairsPerRound < 2) {
    return <p className="text-muted">Cần ít nhất 2 từ trong bài học để luyện dạng này.</p>
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
        if (next.size === pairsPerRound && roundIndex < ROUND_COUNT - 1) {
          setTimeout(() => {
            setRoundIndex((i) => Math.min(ROUND_COUNT - 1, i + 1))
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

  function tileClass(tile: Tile) {
    const isMatched = matched.has(tile.id)
    const isFading = fading.has(tile.id)
    const isSelected = selected?.id === tile.id && selected.side === tile.side
    const isWrong = wrong?.some((w) => w.id === tile.id && w.side === tile.side)
    if (isFading) return 'border-success bg-success-bg scale-75 opacity-0'
    if (isMatched) return 'border-success bg-success-bg opacity-60'
    if (isWrong) return 'border-danger bg-danger-bg text-danger'
    if (isSelected) return 'border-primary bg-primary/10'
    return 'border-hairline hover:bg-surface'
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            setRoundIndex((i) => Math.max(0, i - 1))
            setSelected(null)
          }}
          disabled={roundIndex === 0}
          className="rounded-sm border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
        >
          ← Vòng trước
        </button>
        <p className="text-sm text-muted">
          Đã hoàn thành {completedRounds}/{ROUND_COUNT} vòng
        </p>
        <button
          onClick={() => {
            setRoundIndex((i) => Math.min(ROUND_COUNT - 1, i + 1))
            setSelected(null)
          }}
          disabled={roundIndex === ROUND_COUNT - 1}
          className="rounded-sm border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface disabled:opacity-40"
        >
          Vòng sau →
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {tiles[roundIndex].map((tile) => (
          <button
            key={tile.key}
            onClick={() => clickTile(tile)}
            disabled={matched.has(tile.id)}
            className={`flex min-h-28 items-center justify-center rounded-md border p-5 text-center text-base font-medium transition-all duration-300 ease-out ${tileClass(tile)} ${
              tile.side === 'left' ? 'text-accent-deep' : 'text-ink'
            }`}
          >
            {tile.text}
          </button>
        ))}
      </div>

      <p className="mb-2 font-medium text-ink">Danh sách vòng:</p>
      <div className="flex flex-wrap gap-2">
        {rounds.map((pairs, i) => {
          const isCurrent = i === roundIndex
          const isDone = (matchedByRound[i]?.size ?? 0) === pairs.length
          const stateClass = isCurrent
            ? 'bg-primary text-canvas'
            : isDone
              ? 'border border-success bg-success-bg text-success'
              : 'border border-hairline text-ink hover:bg-surface'
          return (
            <button
              key={i}
              onClick={() => {
                setRoundIndex(i)
                setSelected(null)
              }}
              className={`h-9 w-9 rounded-sm text-sm font-medium ${stateClass}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
