import { cloneElement, forwardRef, useId, type HTMLAttributes, type ReactElement, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, focusRing } from './cn'

// --- Tiêu đề trang và tiêu đề mục ---
export function PageHeader({ title, description, actions, back, className }: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Liên kết quay lại trang cha, hiện phía trên tiêu đề. */
  back?: { to: string; label: string }
  className?: string
}) {
  return (
    <header className={cn('mb-6', className)}>
      {back && (
        <Link to={back.to} className={cn('mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-karte text-sm font-medium text-radiert hover:text-bleistift', focusRing)}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-bleistift sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-prose text-radiert">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function SectionHeader({ title, description, action, className }: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2', className)}>
      <div className="min-w-0">
        <h2 className="font-display text-lg font-semibold text-bleistift">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-radiert">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// --- Thẻ ---
export type CardVariant = 'default' | 'sunken' | 'highlight' | 'dashed'

const cardVariants: Record<CardVariant, string> = {
  // Karteikarte nằm trên bìa: mép thẻ, ánh đèn (ban đêm), bóng thẻ xếp chồng (ban ngày).
  default: 'border border-kartenrand bg-karteikarte lampenlicht shadow-lift',
  // Vùng lõm: khay trong hộp, không bóng.
  sunken: 'border border-linie bg-karteikarte-innen',
  // Thẻ đang chọn hoặc đang làm: mép chì than.
  highlight: 'border border-bleistift bg-karteikarte lampenlicht shadow-lift',
  // Chỗ trống, vùng thả tệp: viền đứt.
  dashed: 'border border-dashed border-kante',
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
  /** Có tiêu đề thì thẻ có đầu thẻ với dòng đỏ (Karteikarte), thân thẻ tự có lề. */
  title?: ReactNode
  action?: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', title, action, className, children, ...props },
  ref,
) {
  const cls = cn('rounded-karte text-bleistift', cardVariants[variant], !title && 'p-5', className)
  if (!title) return <div ref={ref} data-card="" className={cls} {...props}>{children}</div>
  return (
    <div ref={ref} data-card="" className={cls} {...props}>
      <div className="flex min-h-14 items-center justify-between gap-3 border-b-2 border-kopfzeile px-5 py-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
})

// --- Nhãn, huy hiệu, số liệu ---
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-reiter border border-linie bg-karteikarte-innen px-2.5 py-0.5 text-xs font-medium text-radiert', className)}>
      {children}
    </span>
  )
}

export type BadgeTone = 'neutral' | 'ok' | 'bad' | 'info' | 'emph'

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-karteikarte-innen text-radiert border border-linie',
  ok: 'bg-aufstieg-soft text-aufstieg',
  bad: 'bg-rotstift-soft text-rotstift',
  info: 'bg-tinte-soft text-tinte',
  // Hổ phách: chỉ cho thứ người học đã đạt được.
  emph: 'bg-reiter text-reiter-beschriftung',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-rund px-2 py-0.5 text-xs font-semibold whitespace-nowrap', badgeTones[tone], className)}>
      {children}
    </span>
  )
}

export function Stat({ label, value, hint, className }: { label: ReactNode; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-sm text-radiert">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-semibold text-bleistift">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-hauch">{hint}</p>}
    </div>
  )
}

/** Bảng: cuộn ngang trên điện thoại thay vì tràn trang. Dùng <table> bình thường bên trong. */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-karte border border-linie', className)}>
      <table className="w-full border-collapse text-sm [&_td]:border-t [&_td]:border-linie [&_td]:px-3 [&_td]:py-2.5 [&_th]:bg-karteikarte-innen [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:whitespace-nowrap">
        {children}
      </table>
    </div>
  )
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-t border-linie', className)} />
}

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]?.toUpperCase()).join('') || '?'
  if (src) return <img src={src} alt={name} className={cn('size-9 shrink-0 rounded-rund border border-linie object-cover', className)} />
  return (
    <span aria-label={name} role="img"
      className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-rund border border-linie bg-karteikarte-innen text-sm font-semibold text-radiert', className)}>
      {initials}
    </span>
  )
}

/** Chú thích khi rê chuột hoặc focus. Phần tử bên trong phải bấm/focus được. */
export function Tooltip({ content, children }: { content: ReactNode; children: ReactElement<{ 'aria-describedby'?: string }> }) {
  const id = useId()
  return (
    <span className="group/tip relative inline-flex">
      {cloneElement(children, { 'aria-describedby': id })}
      <span id={id} role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-popover mb-1.5 -translate-x-1/2 rounded-karte bg-bleistift px-2 py-1 text-xs whitespace-nowrap text-bleistift-invers opacity-0 shadow-pop transition-opacity duration-150 group-focus-within/tip:visible group-focus-within/tip:opacity-100 group-hover/tip:visible group-hover/tip:opacity-100">
        {content}
      </span>
    </span>
  )
}

/** Thanh tiến độ. value từ 0 tới 1. Hổ phách chỉ khi thanh đo một thành tích (mục tiêu, thành thạo). */
export function ProgressBar({ value, label, tone = 'default', className }: {
  value: number
  label: string
  tone?: 'default' | 'emph'
  className?: string
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
      className={cn('h-1.5 overflow-hidden rounded-rund bg-linie', className)}>
      <div className={cn('h-full rounded-rund transition-[width] duration-300', tone === 'emph' ? 'bg-reiter' : 'bg-bleistift')} style={{ width: `${percent}%` }} />
    </div>
  )
}
