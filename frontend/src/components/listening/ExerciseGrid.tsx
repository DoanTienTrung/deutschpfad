import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { cn, focusRing } from '@kit'
import type { ListeningExerciseSummary } from '../../api/types'
import { getYoutubeThumbnailUrl, formatDuration } from '../../lib/youtubeThumbnail'
import AudioCardArt from './AudioCardArt'

export default function ExerciseGrid({ exercises }: { exercises: ListeningExerciseSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {exercises.map((exercise, i) => (
        <Link
          key={exercise.id}
          to={`/app/listening/${exercise.id}`}
          style={{ '--stagger-index': i % 12 } as CSSProperties}
          className={cn('stagger-in group rounded-karte', focusRing)}
        >
          <div className="relative aspect-video overflow-hidden rounded-karte border border-kartenrand bg-karteikarte-innen shadow-lift">
            {exercise.youtubeVideoId ? (
              <img
                src={getYoutubeThumbnailUrl(exercise.youtubeVideoId)}
                alt={exercise.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <AudioCardArt />
            )}
            <span className="absolute top-2 left-2 rounded-rund bg-foto-etikett px-2 py-0.5 text-xs font-bold text-foto-etikett-schrift">
              {exercise.levelMin === exercise.levelMax
                ? exercise.levelMin
                : `${exercise.levelMin}-${exercise.levelMax}`}
            </span>
            {exercise.durationSeconds != null && (
              <span className="absolute bottom-2 right-2 rounded-karte bg-foto-etikett px-1.5 py-0.5 text-xs font-medium text-foto-etikett-schrift">
                {formatDuration(exercise.durationSeconds)}
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-bleistift group-hover:underline underline-offset-4" title={exercise.title}>
            {exercise.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-radiert">
            {[exercise.channelName ?? exercise.sourceLabel, `${exercise.sentenceCount} câu`].filter(Boolean).join(' · ')}
          </p>
        </Link>
      ))}
    </div>
  )
}
