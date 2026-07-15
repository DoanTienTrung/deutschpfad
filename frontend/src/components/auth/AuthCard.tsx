import type { ReactNode } from 'react'

export default function AuthCard({
  title,
  children,
  footer,
}: {
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-lifted">
        <h1 className="mb-6 text-center font-display text-2xl font-semibold text-ink text-balance">
          {title}
        </h1>
        {children}
        {footer && <div className="mt-6 space-y-1 text-center text-sm">{footer}</div>}
      </div>
    </div>
  )
}
