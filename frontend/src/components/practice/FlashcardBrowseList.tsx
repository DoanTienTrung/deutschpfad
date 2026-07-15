import { useState } from 'react'
import type { VocabularyItem } from '../../api/types'
import { speak } from '../../lib/speech'

const PAGE_SIZE = 25

export default function FlashcardBrowseList({
  items,
  onStartPractice,
}: {
  items: VocabularyItem[]
  onStartPractice: () => void
}) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pageItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div>
      <button
        onClick={onStartPractice}
        className="mb-4 w-full rounded-md border border-primary bg-primary/5 px-6 py-3 text-center font-medium text-primary hover:bg-primary/10"
      >
        Luyện tập flashcards
      </button>

      <p className="mb-4 text-sm text-muted">List có {items.length} từ</p>

      <div className="space-y-3">
        {pageItems.map((item) => (
          <div key={item.id} className="rounded-md border border-hairline bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg font-semibold text-ink">{item.germanWord}</span>
              {item.wordType && <span className="text-sm text-muted">({item.wordType})</span>}
              {item.phonetic && <span className="text-sm text-muted">/{item.phonetic}/</span>}
              <button
                onClick={() => speak(item.germanWord)}
                aria-label="Phát âm"
                className="text-lg text-primary"
              >
                🔊
              </button>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-muted">Định nghĩa</p>
              <p className="text-ink">{item.vietnameseMeaning}</p>
              {item.englishMeaning && <p className="text-sm text-muted">= {item.englishMeaning}</p>}
            </div>

            {item.exampleSentence && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase text-muted">Ví dụ</p>
                <p className="flex items-start gap-2 text-sm text-ink">
                  <button
                    onClick={() => speak(item.exampleSentence as string)}
                    aria-label="Phát âm câu ví dụ"
                    className="mt-0.5 shrink-0 text-primary"
                  >
                    🔊
                  </button>
                  <span className="italic">{item.exampleSentence}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-sm px-3 py-1.5 text-sm font-medium ${
                page === p ? 'bg-primary text-canvas' : 'border border-hairline text-ink hover:bg-surface'
              }`}
            >
              Trang {p + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
