import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'

type FieldStatus = 'default' | 'error' | 'success'

const Field = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; status?: FieldStatus }>(function Field(
  { label, id, type, className = '', status = 'default', ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && visible ? 'text' : type

  const borderClass =
    status === 'error' ? 'border-danger' : status === 'success' ? 'border-success' : 'border-hairline'
  const focusBorderClass =
    status === 'error'
      ? 'focus:border-danger'
      : status === 'success'
        ? 'focus:border-success'
        : 'focus:border-primary'
  const focusRingClass =
    status === 'error' ? 'focus:ring-danger/20' : status === 'success' ? 'focus:ring-success/20' : 'focus:ring-primary/20'

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          type={inputType}
          className={`w-full rounded-sm border ${borderClass} bg-canvas px-3.5 py-2.5 text-ink font-sans placeholder:text-muted transition-[border-color,box-shadow] duration-150 ${focusBorderClass} focus:outline-none focus:ring-3 ${focusRingClass} ${isPassword ? 'pr-11' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            aria-pressed={visible}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-sm"
          >
            {visible ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58a2 2 0 002.83 2.83" />
                <path d="M9.88 4.24A9.4 9.4 0 0112 4c5 0 9 4 10.5 8-.47 1.31-1.19 2.6-2.13 3.71M6.6 6.6C4.3 8.09 2.6 10.16 1.5 12c1.5 4 5.5 8 10.5 8 1.5 0 2.94-.35 4.24-.96" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1.5 12S5.5 4 12 4s10.5 8 10.5 8-4 8-10.5 8S1.5 12 1.5 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
})

export default Field
