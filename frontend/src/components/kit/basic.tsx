import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn, focusRing } from './cn'
import { buttonClass, type ButtonSize, type ButtonVariant } from './button-class'

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <svg className={cn('size-4 animate-spin', className)} viewBox="0 0 24 24" fill="none"
      role={label ? 'status' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Icon đứng trước chữ. */
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, icon, className, disabled, children, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)}
      disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
})

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Bắt buộc: nút chỉ có icon thì phải có tên cho trình đọc màn hình. */
  label: string
  icon: ReactNode
  variant?: Exclude<ButtonVariant, 'danger'>
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = 'ghost', className, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label}
      className={buttonClass(variant, 'md', cn('size-11 shrink-0 px-0', className))} {...props}>
      {icon}
    </button>
  )
})

type ButtonLinkProps = LinkProps & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode }

/** Liên kết trông như nút (đi tới trang khác thay vì làm một hành động). */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant = 'primary', size = 'md', icon, className, children, ...props },
  ref,
) {
  return (
    <Link ref={ref} className={buttonClass(variant, size, typeof className === 'string' ? className : undefined)} {...props}>
      {icon}
      {children}
    </Link>
  )
})

/** Liên kết trong dòng chữ: gạch chân, đổi màu khi rê chuột. Dùng `to` cho trang trong app, `href` cho trang ngoài. */
export const TextLink = forwardRef<HTMLAnchorElement, (LinkProps | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })) & { className?: string }>(
  function TextLink({ className, ...props }, ref) {
    const cls = cn('font-medium text-bleistift underline underline-offset-4 decoration-kante hover:decoration-bleistift rounded-karte', focusRing, className)
    if ('to' in props) return <Link ref={ref} className={cls} {...props} />
    return <a ref={ref} className={cls} {...props} />
  },
)
