export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-hairline/60 ${className}`} />
}

// Mirrors ExerciseGrid/ReadingPassageGrid's card shape (aspect-video thumbnail + title + meta
// line) so the loading state doesn't jump/reflow once real cards arrive.
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1.5 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

// Mirrors the lesson/deck list-card shape used across VocabularyHubPage/DecksPage.
export function ListCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border border-hairline bg-white p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-2/3" />
          <Skeleton className="mt-4 h-9 w-full rounded-sm" />
        </div>
      ))}
    </div>
  )
}
