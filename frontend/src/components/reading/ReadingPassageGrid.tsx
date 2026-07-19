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
          <div className="relative aspect-video overflow-hidden rounded-lg bg-surface">
            {passage.imageUrl ? (
              <img
                src={passage.imageUrl}
                alt={passage.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/15 via-accent/5 to-transparent text-3xl">
                📖
              </div>
            )}
            <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-canvas">
              {passage.levelMin === passage.levelMax ? passage.levelMin : `${passage.levelMin}-${passage.levelMax}`}
            </span>
            {passage.imageAttributionName && passage.imageAttributionUrl && (
              <a
                href={passage.imageAttributionUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-2 right-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white hover:underline"
              >
                Ảnh: {passage.imageAttributionName}
              </a>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-ink group-hover:text-primary">{passage.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {passage.questionCount} câu hỏi{passage.topic ? ` · ${passage.topic}` : ''}
            {passage.sourceLabel ? ` · ${passage.sourceLabel}` : ''}
          </p>
        </Link>
      ))}
    </div>
  )
}
