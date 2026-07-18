const BAR_HEIGHTS = [40, 65, 90, 55, 100, 70, 45, 80, 60]

export default function AudioCardArt() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-accent/15 via-accent/5 to-transparent">
      <div className="flex items-end gap-[3px]" aria-hidden>
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="w-1 rounded-full bg-accent-deep/70"
            style={{ height: `${h * 0.28}px` }}
          />
        ))}
      </div>

      <span className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-primary text-canvas shadow-lifted">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-4 w-4">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  )
}
