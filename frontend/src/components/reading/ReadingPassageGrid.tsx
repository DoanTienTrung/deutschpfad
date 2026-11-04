import { BookOpenText } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReadingPassageSummary } from '../../api/types'

export default function ReadingPassageGrid({ passages }: { passages: ReadingPassageSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {passages.map((passage, i) => (
        <Link
          key={passage.id}
          to={`/app/reading/${passage.id}`}
          style={{ '--stagger-index': i % 12 } as React.CSSProperties}
          className="stagger-in group"
        >
          <div className="relative aspect-video overflow-hidden rounded-karte bg-karteikarte-innen">
            {passage.imageUrl ? (
              <img
                src={passage.imageUrl}
                alt={passage.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-karteikarte-innen textur-linien text-hauch">
                <BookOpenText className="size-8" aria-hidden="true" />
              </div>
            )}
            <span className="absolute top-2 left-2 rounded-rund bg-foto-etikett px-2 py-0.5 text-xs font-bold text-foto-etikett-schrift">
              {passage.levelMin === passage.levelMax ? passage.levelMin : `${passage.levelMin}-${passage.levelMax}`}
            </span>
            {passage.imageAttributionName && passage.imageAttributionUrl && (
              <a
                href={passage.imageAttributionUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-2 right-2 rounded-karte bg-foto-etikett px-1.5 py-0.5 text-xs font-medium text-foto-etikett-schrift hover:underline"
              >
                Ảnh: {passage.imageAttributionName}
              </a>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-bleistift group-hover:text-bleistift">{passage.title}</p>
          <p className="mt-0.5 text-xs text-radiert">
            {passage.questionCount} câu hỏi{passage.topic ? ` · ${passage.topic}` : ''}
            {passage.sourceLabel ? ` · ${passage.sourceLabel}` : ''}
          </p>
        </Link>
      ))}
    </div>
  )
}
