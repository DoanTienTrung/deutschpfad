import { cn, focusRing } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'sm'

const variants: Record<ButtonVariant, string> = {
  // Nút chính: chì than, bóng lệch cứng như thẻ đè lên bìa. Nhấn xuống thì thẻ ấn sát bìa.
  primary:
    'bg-bleistift text-bleistift-invers shadow-offset hover:bg-bleistift-tief active:translate-x-px active:translate-y-px active:shadow-none',
  secondary: 'border border-kante bg-karteikarte text-bleistift hover:bg-karteikarte-innen',
  ghost: 'text-bleistift hover:bg-bleistift/5',
  danger:
    'bg-rotstift text-bleistift-invers shadow-offset hover:opacity-90 active:translate-x-px active:translate-y-px active:shadow-none',
}

// Vùng chạm 44px trên điện thoại; nút nhỏ chỉ nhỏ lại từ màn sm trở lên.
const sizes: Record<ButtonSize, string> = {
  md: 'min-h-11 px-5 text-sm',
  sm: 'min-h-11 px-3 text-sm sm:min-h-9',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-karte font-semibold transition-[background-color,transform,box-shadow,opacity] duration-150 ease-standard select-none',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0',
    focusRing,
    variants[variant],
    sizes[size],
    className,
  )
}

