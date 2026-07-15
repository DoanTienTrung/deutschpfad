import type { ReactNode } from 'react'

export default function Alert({
  tone,
  children,
}: {
  tone: 'danger' | 'success'
  children: ReactNode
}) {
  const tones = {
    danger: 'bg-danger-bg text-danger',
    success: 'bg-success-bg text-success',
  }
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={`mb-4 rounded-sm p-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  )
}
