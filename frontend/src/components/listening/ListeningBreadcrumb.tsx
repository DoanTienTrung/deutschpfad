import { Link } from 'react-router-dom'

type Crumb = { label: string; to?: string; onClick?: () => void }

export default function ListeningBreadcrumb({ items }: { items: Crumb[] }) {
  const linkClass = 'rounded-full px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-accent/20'
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, i) => (
        // min-w-0/max-w-full let the final crumb (a long exercise title) actually truncate --
        // without them, flex items refuse to shrink below their content width and the text
        // overflows past the right edge of the screen on phones.
        <span key={i} className="flex min-w-0 max-w-full items-center gap-1">
          {i > 0 && <span className="shrink-0 px-0.5 text-muted">›</span>}
          {item.to ? (
            <Link to={item.to} className={linkClass}>
              {item.label}
            </Link>
          ) : item.onClick ? (
            <button onClick={item.onClick} className={linkClass}>
              {item.label}
            </button>
          ) : (
            <span className="min-w-0 truncate px-2.5 py-1 font-semibold text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
