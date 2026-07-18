import { Link } from 'react-router-dom'

type Crumb = { label: string; to?: string; onClick?: () => void }

export default function ListeningBreadcrumb({ items }: { items: Crumb[] }) {
  const linkClass = 'rounded-full px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-accent/20'
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="px-0.5 text-muted">›</span>}
          {item.to ? (
            <Link to={item.to} className={linkClass}>
              {item.label}
            </Link>
          ) : item.onClick ? (
            <button onClick={item.onClick} className={linkClass}>
              {item.label}
            </button>
          ) : (
            <span className="truncate px-2.5 py-1 font-semibold text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
