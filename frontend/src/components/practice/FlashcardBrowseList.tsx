import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { Article, Button, Card, IconButton, Pagination } from '@kit'
import type { VocabularyItem } from '../../api/types'
import { speak } from '../../lib/speech'
import { spokenForm } from '../../lib/answer'
import { GermanWord, PluralLine } from './GermanWord'

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
      <Button onClick={onStartPractice} className="mb-4 w-full">Luyện tập flashcards</Button>

      <p className="mb-1 text-sm text-radiert">List có {items.length} từ</p>
      <p className="mb-4 text-xs text-radiert">
        Màu mạo từ: <Article gender="der" /> giống đực ·{' '}
        <Article gender="die" /> giống cái ·{' '}
        <Article gender="das" /> giống trung
      </p>

      <div className="space-y-3">
        {pageItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <GermanWord item={item} className="font-display text-lg font-semibold text-bleistift" />
              {item.wordType && <span className="text-sm text-radiert">({item.wordType})</span>}
              {item.phonetic && <span className="text-sm text-radiert">/{item.phonetic}/</span>}
              <IconButton label="Phát âm" icon={<Volume2 className="size-4" aria-hidden="true" />} onClick={() => speak(spokenForm(item.germanWord))} />
            </div>
            <PluralLine plural={item.plural} className="mt-1 block text-sm text-radiert" />

            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-radiert">Định nghĩa</p>
              <p className="text-bleistift">{item.vietnameseMeaning}</p>
              {item.englishMeaning && <p className="text-sm text-radiert">= {item.englishMeaning}</p>}
            </div>

            {item.exampleSentence && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase text-radiert">Ví dụ</p>
                <p className="flex items-center gap-1 text-sm text-bleistift">
                  <IconButton label="Phát âm câu ví dụ" icon={<Volume2 className="size-4" aria-hidden="true" />}
                    onClick={() => speak(item.exampleSentence as string)} className="-ml-2" />
                  <span className="italic">{item.exampleSentence}</span>
                </p>
                {item.exampleSentenceVi && <p className="ml-9 text-sm text-radiert">{item.exampleSentenceVi}</p>}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Pagination page={page + 1} pageCount={totalPages} onChange={(p) => setPage(p - 1)} className="mt-6" />
    </div>
  )
}
