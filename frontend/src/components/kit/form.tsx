import {
  forwardRef, useEffect, useId, useRef, useState,
  type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react'
import { Check, ChevronDown, Eye, EyeOff, Search } from 'lucide-react'
import { cn, focusRing } from './cn'
import { FieldContext, useFieldControl } from './field-context'

// --- Field: nhãn + ô nhập + gợi ý + lỗi ---
export function Field({ label, hint, error, required, className, children }: {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
  children: ReactNode
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  return (
    <FieldContext.Provider value={{ id, describedBy: [errorId, hintId].filter(Boolean).join(' ') || undefined, invalid: Boolean(error) }}>
      <div className={cn('space-y-1.5', className)}>
        <label htmlFor={id} className="block text-sm font-medium text-bleistift">
          {label}
          {required && <span className="text-rotstift" aria-hidden="true"> *</span>}
        </label>
        {children}
        {error && <p id={errorId} className="text-sm text-rotstift">{error}</p>}
        {hint && <p id={hintId} className="text-sm text-radiert">{hint}</p>}
      </div>
    </FieldContext.Provider>
  )
}

// Ô nhập: chữ 16px để Safari trên iPhone không tự phóng to trang khi chạm vào.
const control =
  'w-full rounded-karte border border-kante bg-karteikarte text-base text-bleistift placeholder:text-hauch transition-[border-color,box-shadow] duration-150 ' +
  'hover:border-radiert focus-visible:border-bleistift focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-fokus/30 ' +
  'aria-invalid:border-rotstift disabled:cursor-not-allowed disabled:opacity-60'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, type = 'text', invalid, ...props }, ref) {
  const a11y = useFieldControl({ ...props, 'aria-invalid': invalid || props['aria-invalid'] })
  const [visible, setVisible] = useState(false)
  if (type !== 'password') {
    return <input ref={ref} type={type} className={cn(control, 'min-h-11 px-3', className)} {...props} {...a11y} />
  }
  return (
    <div className="relative">
      <input ref={ref} type={visible ? 'text' : 'password'} className={cn(control, 'min-h-11 pr-11 pl-3', className)} {...props} {...a11y} />
      <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
        className={cn('absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-karte text-radiert hover:text-bleistift', focusRing)}>
        {visible ? <EyeOff className="size-4.5" aria-hidden="true" /> : <Eye className="size-4.5" aria-hidden="true" />}
      </button>
    </div>
  )
})

export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(function SearchInput({ className, ...props }, ref) {
  const a11y = useFieldControl(props)
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hauch" aria-hidden="true" />
      <input ref={ref} type="search" className={cn(control, 'min-h-11 pr-3 pl-9', className)} {...props} {...a11y} />
    </div>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, rows = 4, ...props }, ref) {
    const a11y = useFieldControl({ ...props, 'aria-invalid': invalid || props['aria-invalid'] })
    return <textarea ref={ref} rows={rows} className={cn(control, 'min-h-24 px-3 py-2 leading-relaxed', className)} {...props} {...a11y} />
  },
)

/** Select của trình duyệt: dùng trên điện thoại hoặc khi danh sách dài. */
export const NativeSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  function NativeSelect({ className, invalid, children, ...props }, ref) {
    const a11y = useFieldControl({ ...props, 'aria-invalid': invalid || props['aria-invalid'] })
    return (
      <div className="relative">
        <select ref={ref} className={cn(control, 'min-h-11 appearance-none pr-9 pl-3', className)} {...props} {...a11y}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-radiert" aria-hidden="true" />
      </div>
    )
  },
)

export interface SelectOption { value: string; label: ReactNode }

/** Select tự vẽ: danh sách ngắn, cần hiện đẹp. Bàn phím: mũi tên, Home/End, Enter, Esc. */
export function Select({ value, onChange, options, placeholder = 'Chọn...', disabled, className, id: idProp, ...rest }: {
  value: string | null
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}) {
  const a11y = useFieldControl({ id: idProp, ...rest })
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function openList() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }
  function choose(index: number) {
    const option = options[index]
    if (option) onChange(option.value)
    setOpen(false)
  }
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList() }
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(options.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active) }
    else if (e.key === 'Escape' || e.key === 'Tab') setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button type="button" disabled={disabled} onClick={() => (open ? setOpen(false) : openList())} onKeyDown={onKeyDown}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        className={cn(control, 'flex min-h-11 items-center justify-between gap-2 px-3 text-left', !selected && 'text-hauch')} {...a11y}>
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={cn('size-4 shrink-0 text-radiert transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <ul id={listId} role="listbox" className="absolute z-popover mt-1 max-h-64 w-full overflow-auto rounded-karte bg-karteikarte p-1 shadow-pop animate-erscheinen">
          {options.map((option, index) => (
            <li key={option.value} id={`${listId}-${index}`} role="option" aria-selected={option.value === value}
              onMouseEnter={() => setActive(index)} onMouseDown={(e) => { e.preventDefault(); choose(index) }}
              className={cn('flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-karte px-3 text-sm',
                index === active && 'bg-karteikarte-innen', option.value === value && 'font-semibold')}>
              <span>{option.label}</span>
              {option.value === value && <Check className="size-4" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// --- Chọn: checkbox, radio, switch. Cả dòng là vùng chạm 44px. ---
type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode; description?: ReactNode }

export const Checkbox = forwardRef<HTMLInputElement, ChoiceProps>(function Checkbox({ label, description, className, ...props }, ref) {
  return (
    <label className={cn('flex min-h-11 cursor-pointer items-start gap-3 py-2.5 has-disabled:cursor-not-allowed has-disabled:opacity-60', className)}>
      <span className="relative mt-0.5 flex size-5 shrink-0">
        <input ref={ref} type="checkbox"
          className={cn('peer size-5 cursor-pointer appearance-none rounded-karte border border-kante bg-karteikarte checked:border-bleistift checked:bg-bleistift disabled:cursor-not-allowed', focusRing)}
          {...props} />
        <Check className="pointer-events-none absolute inset-0.5 size-4 text-bleistift-invers opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden="true" />
      </span>
      <span className="text-sm">
        <span className="text-bleistift">{label}</span>
        {description && <span className="mt-0.5 block text-radiert">{description}</span>}
      </span>
    </label>
  )
})

export const Radio = forwardRef<HTMLInputElement, ChoiceProps>(function Radio({ label, description, className, ...props }, ref) {
  return (
    <label className={cn('flex min-h-11 cursor-pointer items-start gap-3 py-2.5 has-disabled:cursor-not-allowed has-disabled:opacity-60', className)}>
      <input ref={ref} type="radio"
        className={cn('mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-rund border border-kante bg-karteikarte checked:border-6 checked:border-bleistift disabled:cursor-not-allowed', focusRing)}
        {...props} />
      <span className="text-sm">
        <span className="text-bleistift">{label}</span>
        {description && <span className="mt-0.5 block text-radiert">{description}</span>}
      </span>
    </label>
  )
})

export function Switch({ checked, onChange, label, disabled, className }: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  disabled?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('flex min-h-11 items-center justify-between gap-3', className)}>
      <span id={id} className="text-sm text-bleistift">{label}</span>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={id} disabled={disabled} onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-rund border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'border-bleistift bg-bleistift' : 'border-kante bg-karteikarte-innen', focusRing)}>
        <span className={cn('absolute top-0.5 left-0.5 size-4.5 rounded-rund shadow-lift transition-transform duration-150 ease-standard',
          checked ? 'translate-x-5 bg-bleistift-invers' : 'bg-karteikarte')} />
      </button>
    </div>
  )
}

export const Slider = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>>(function Slider({ className, ...props }, ref) {
  const a11y = useFieldControl(props)
  return <input ref={ref} type="range" className={cn('h-11 w-full cursor-pointer accent-bleistift', focusRing, className)} {...props} {...a11y} />
})

/** Chọn tệp: khung viền đứt (vùng thả), nút chọn tệp mang dáng nút chính. */
export const FileInput = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>>(function FileInput({ className, ...props }, ref) {
  const a11y = useFieldControl(props)
  return (
    <input ref={ref} type="file"
      className={cn('block w-full cursor-pointer rounded-karte border border-dashed border-kante bg-karteikarte p-2 text-sm text-radiert',
        'file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-karte file:border-0 file:bg-bleistift file:px-3 file:text-sm file:font-semibold file:text-bleistift-invers hover:file:bg-bleistift-tief',
        focusRing, className)}
      {...props} {...a11y} />
  )
})
