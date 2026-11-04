import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, focusRing } from './cn'

// --- Thẻ bấm được: cả thẻ là một liên kết hoặc một nút ---
const cardButton =
  'block w-full rounded-karte border border-kartenrand bg-karteikarte lampenlicht p-5 text-left text-bleistift shadow-lift ' +
  'transition-[transform,border-color,box-shadow] duration-150 ease-standard hover:-translate-y-0.5 hover:border-kante ' +
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

type CardButtonProps =
  | ({ to: string; className?: string; children: ReactNode })
  | (ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined })

export function CardButton(props: CardButtonProps) {
  if (props.to !== undefined) {
    const { to, className, children } = props
    return <Link to={to} data-card="" className={cn(cardButton, focusRing, className)}>{children}</Link>
  }
  const { className, type = 'button', ...rest } = props
  return <button type={type} data-card="" className={cn(cardButton, focusRing, className)} {...rest} />
}

// --- Dòng bấm được trong danh sách ---
type RowButtonProps = {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Mặc định là mũi tên sang phải. */
  trailing?: ReactNode
  /** Dòng đang chọn trong một danh sách lựa chọn (vd. chế độ luyện). */
  selected?: boolean
  className?: string
} & ({ to: string; onClick?: undefined } | { to?: undefined; onClick: () => void })

export function RowButton({ icon, title, description, trailing, selected, className, ...target }: RowButtonProps) {
  const body = (
    <>
      {icon && <span className="flex size-9 shrink-0 items-center justify-center rounded-karte bg-karteikarte-innen text-radiert [&_svg]:size-4.5">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-bleistift">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-radiert">{description}</span>}
      </span>
      <span className="shrink-0 text-hauch">{trailing ?? <ChevronRight className="size-4" aria-hidden="true" />}</span>
    </>
  )
  const cls = cn('flex min-h-14 w-full items-center gap-3 rounded-karte px-3 py-2.5 text-left', selected ? 'bg-bleistift/10' : 'hover:bg-karteikarte-innen', focusRing, className)
  if (target.to !== undefined) return <Link to={target.to} aria-current={selected ? 'page' : undefined} className={cls}>{body}</Link>
  return <button type="button" onClick={target.onClick} aria-pressed={selected} className={cls}>{body}</button>
}

// --- Dòng cài đặt: nhãn bên trái, điều khiển bên phải ---
export function SettingRow({ label, description, children, className }: {
  label: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3', className)}>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-bleistift">{label}</p>
        {description && <p className="mt-0.5 text-sm text-radiert">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// --- Mở/gập nội dung ---
export function Disclosure({ summary, children, defaultOpen, className }: {
  summary: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  return (
    <details open={defaultOpen} className={cn('group rounded-karte border border-linie bg-karteikarte', className)}>
      <summary className={cn('flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-karte px-4 py-2.5 font-medium text-bleistift [&::-webkit-details-marker]:hidden', focusRing)}>
        {summary}
        <ChevronDown className="size-4 shrink-0 text-radiert transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-linie px-4 py-3 text-sm text-bleistift">{children}</div>
    </details>
  )
}

// --- Chip: lọc/chọn nhanh, dáng tab chia ngăn ---
export const Chip = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }>(
  function Chip({ selected = false, className, type = 'button', ...props }, ref) {
    return (
      <button ref={ref} type={type} aria-pressed={selected}
        className={cn('inline-flex min-h-11 items-center gap-1.5 rounded-reiter border px-3.5 text-sm font-medium transition-colors duration-150 sm:min-h-9',
          selected ? 'border-bleistift bg-bleistift text-bleistift-invers' : 'border-kante bg-karteikarte text-bleistift hover:bg-karteikarte-innen',
          'disabled:cursor-not-allowed disabled:opacity-50', focusRing, className)}
        {...props} />
    )
  },
)

// --- Nút nổi góc dưới phải (điện thoại) ---
export function Fab({ label, icon, onClick, className }: { label: string; icon: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={cn('fixed right-4 bottom-safe z-panel flex size-14 items-center justify-center rounded-rund bg-bleistift text-bleistift-invers shadow-pop hover:bg-bleistift-tief [&_svg]:size-6', focusRing, className)}>
      {icon}
    </button>
  )
}
