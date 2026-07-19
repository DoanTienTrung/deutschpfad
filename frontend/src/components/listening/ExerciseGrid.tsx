import { Link } from 'react-router-dom'
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
          style={{ '--stagger-index': i % 12 } as React.CSSProperties}
          className="stagger-in group"
        >
          <div className="relative aspect-video overflow-hidden rounded-lg bg-surface">
            {exercise.youtubeVideoId ? (
              <img
                src={getYoutubeThumbnailUrl(exercise.youtubeVideoId)}
                alt={exercise.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <AudioCardArt />
            )}
            <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-canvas">
              {exercise.levelMin === exercise.levelMax
                ? exercise.levelMin
                : `${exercise.levelMin}-${exercise.levelMax}`}
            </span>
            {exercise.durationSeconds != null && (
              <span className="absolute bottom-2 right-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                {formatDuration(exercise.durationSeconds)}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-ink group-hover:text-primary">{exercise.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {exercise.sentenceCount} câu{exercise.sourceLabel ? ` · ${exercise.sourceLabel}` : ''}
          </p>
        </Link>
      ))}
    </div>
  )
}
