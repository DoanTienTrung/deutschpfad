import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { cn, focusRing } from './cn'

export interface TabItem { value: string; label: ReactNode; count?: number }

// Phím mũi tên trái/phải, Home/End để chuyển giữa các lựa chọn (tabs, segmented).
function useRovingKeys(values: string[], value: string, onChange: (value: string) => void) {
  const listRef = useRef<HTMLDivElement>(null)
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = values.indexOf(value)
    let next = -1
    if (e.key === 'ArrowRight') next = (index + 1) % values.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + values.length) % values.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = values.length - 1
    if (next < 0) return
    e.preventDefault()
    onChange(values[next])
    requestAnimationFrame(() => listRef.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus())
  }
  return { listRef, onKeyDown }
}

/** Tab chia ngăn: tab đang mở nhô lên, liền với nội dung bên dưới. */
export function Tabs({ items, value, onChange, label, children, className }: {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  label: string
  children: ReactNode
  className?: string
}) {
  const id = useId()
  const { listRef, onKeyDown } = useRovingKeys(items.map((i) => i.value), value, onChange)
  return (
    <div className={className}>
      <div ref={listRef} role="tablist" aria-label={label} onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-kartenrand">
        {items.map((item) => {
          const selected = item.value === value
          return (
            <button key={item.value} type="button" role="tab" id={`${id}-tab-${item.value}`} aria-selected={selected}
              aria-controls={`${id}-panel`} tabIndex={selected ? 0 : -1} onClick={() => onChange(item.value)}
              className={cn('-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 rounded-t-reiter border border-b-0 px-4 text-sm font-medium whitespace-nowrap',
                selected ? 'border-kartenrand bg-karteikarte text-bleistift' : 'border-transparent text-radiert hover:bg-karteikarte-innen hover:text-bleistift',
                focusRing)}>
              {item.label}
              {item.count !== undefined && <span className="rounded-rund bg-karteikarte-innen px-1.5 text-xs text-radiert">{item.count}</span>}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${value}`} className="pt-4">
        {children}
      </div>
    </div>
  )
}

/** Chọn một trong vài lựa chọn ngắn, nằm trên cùng một dòng. */
export function Segmented({ options, value, onChange, label, className }: {
  /** title: tên lựa chọn khi nhãn chỉ là icon. */
  options: { value: string; label: ReactNode; title?: string }[]
  value: string
  onChange: (value: string) => void
  label: string
  className?: string
}) {
  const { listRef, onKeyDown } = useRovingKeys(options.map((o) => o.value), value, onChange)
  return (
    <div ref={listRef} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}
      className={cn('inline-flex rounded-karte border border-kante bg-karteikarte-innen p-0.5', className)}>
      {options.map((option) => {
        const checked = option.value === value
        return (
          <button key={option.value} type="button" role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1}
            aria-label={option.title} title={option.title} onClick={() => onChange(option.value)}
            className={cn('inline-flex min-h-10 items-center justify-center gap-1.5 rounded-karte text-sm font-medium', typeof option.label === 'string' ? 'px-3' : 'px-2.5',
              checked ? 'border border-kartenrand bg-karteikarte text-bleistift' : 'border border-transparent text-radiert hover:text-bleistift', focusRing)}>
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** Các bước của một quy trình. */
export function Stepper({ steps, current, className }: { steps: ReactNode[]; current: number; className?: string }) {
  return (
    <ol className={cn('flex flex-wrap items-center gap-x-2 gap-y-2', className)}>
      {steps.map((step, index) => {
        const done = index < current
        const here = index === current
        return (
          <li key={index} aria-current={here ? 'step' : undefined} className="flex items-center gap-2">
            <span className={cn('flex size-7 items-center justify-center rounded-rund border text-xs font-semibold',
              done ? 'border-aufstieg bg-aufstieg text-bleistift-invers' : here ? 'border-bleistift bg-bleistift text-bleistift-invers' : 'border-kante text-hauch')}>
              {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : index + 1}
            </span>
            <span className={cn('text-sm', here ? 'font-semibold text-bleistift' : 'text-radiert')}>{step}</span>
            {index < steps.length - 1 && <span className="h-px w-6 bg-kante" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

/** Mục điều hướng ở thanh bên. Thu gọn thì chỉ còn icon, tên hiện khi rê chuột. */
export function NavItem({ to, icon, label, end, badge, collapsed, onClick }: {
  to: string
  icon: ReactNode
  label: string
  end?: boolean
  badge?: ReactNode
  collapsed?: boolean
  onClick?: () => void
}) {
  return (
    <NavLink to={to} end={end} onClick={onClick} title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined}
      className={({ isActive }) => cn('relative flex min-h-11 items-center gap-3 rounded-karte px-3 text-sm font-medium transition-colors duration-150 [&_svg]:size-4.5 [&_svg]:shrink-0',
        collapsed && 'justify-center px-0',
        isActive ? 'bg-bleistift/10 font-semibold text-bleistift-tief' : 'text-radiert hover:bg-bleistift/5 hover:text-bleistift', focusRing)}>
      {icon}
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {badge && (collapsed ? <span className="absolute top-2 right-2 size-2 rounded-rund bg-rotstift" aria-hidden="true" /> : badge)}
    </NavLink>
  )
}

/** Phân trang: trang hiện tại, hai bên, đầu và cuối; khoảng giữa thành dấu ba chấm. */
export function Pagination({ page, pageCount, onChange, className }: {
  page: number
  pageCount: number
  onChange: (page: number) => void
  className?: string
}) {
  if (pageCount <= 1) return null
  const pages: (number | 'gap')[] = []
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== 'gap') pages.push('gap')
  }
  const cell = cn('inline-flex min-h-11 min-w-11 items-center justify-center rounded-karte text-sm font-medium sm:min-h-9 sm:min-w-9', focusRing)
  return (
    <nav aria-label="Phân trang" className={cn('flex items-center justify-center gap-1', className)}>
      <button type="button" className={cn(cell, 'text-bleistift hover:bg-bleistift/5 disabled:opacity-40')} disabled={page <= 1}
        onClick={() => onChange(page - 1)} aria-label="Trang trước">
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {pages.map((p, index) => p === 'gap'
        ? <span key={`gap-${index}`} className="px-1 text-hauch" aria-hidden="true">...</span>
        : (
          <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
            className={cn(cell, p === page ? 'bg-bleistift text-bleistift-invers' : 'text-bleistift hover:bg-bleistift/5')}>
            {p}
          </button>
        ))}
      <button type="button" className={cn(cell, 'text-bleistift hover:bg-bleistift/5 disabled:opacity-40')} disabled={page >= pageCount}
        onClick={() => onChange(page + 1)} aria-label="Trang sau">
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}

export interface Crumb { label: string; to?: string; onClick?: () => void }

/** Đường dẫn vị trí: các cấp cha bấm được, cấp cuối là trang hiện tại (cắt bớt nếu dài). */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  const link = cn('rounded-karte px-1.5 py-1 font-medium text-radiert hover:text-bleistift hover:underline underline-offset-4', focusRing)
  return (
    <nav aria-label="Vị trí trang" className={cn('mb-4 text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-0.5">
        {items.map((item, i) => (
          <li key={i} className="flex min-w-0 max-w-full items-center gap-0.5">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-hauch" aria-hidden="true" />}
            {item.to ? (
              <Link to={item.to} className={link}>{item.label}</Link>
            ) : item.onClick ? (
              <button type="button" onClick={item.onClick} className={link}>{item.label}</button>
            ) : (
              <span aria-current="page" className="min-w-0 truncate px-1.5 py-1 font-semibold text-bleistift">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
