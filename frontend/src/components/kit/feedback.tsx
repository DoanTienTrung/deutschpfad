import { useCallback, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, Star, X } from 'lucide-react'
import { cn, focusRing } from './cn'
import { ToastContext, type ToastInput, type ToastTone } from './toast-context'

// --- Note: 4 sắc thái. Sai và lỗi đọc như nét bút đỏ của thầy, không như còi báo động. ---
export type NoteTone = 'info' | 'ok' | 'emph' | 'bad'

const noteTones: Record<NoteTone, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: 'border-tinte/40 bg-tinte-soft', icon: 'text-tinte', Icon: Info },
  ok: { box: 'border-aufstieg/40 bg-aufstieg-soft', icon: 'text-aufstieg', Icon: CheckCircle2 },
  emph: { box: 'border-reiter/60 bg-reiter-soft', icon: 'text-bleistift', Icon: Star },
  bad: { box: 'border-rotstift/40 bg-rotstift-soft', icon: 'text-rotstift', Icon: AlertTriangle },
}

export function Note({ tone = 'info', title, children, action, className }: {
  tone?: NoteTone
  title?: ReactNode
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const { box, icon, Icon } = noteTones[tone]
  return (
    <div role={tone === 'bad' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-karte border px-4 py-3 text-sm text-bleistift', box, className)}>
      <Icon className={cn('mt-0.5 size-4.5 shrink-0', icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1 leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, description, action, className }: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center rounded-karte border border-dashed border-kante px-6 py-10 text-center', className)}>
      {icon && <div className="mb-3 text-hauch [&_svg]:size-8">{icon}</div>}
      <p className="font-display text-lg font-semibold text-bleistift">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-radiert">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// --- Khung chờ ---
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-karte bg-linie/70', className)} />
}

// Cùng dáng thẻ của ExerciseGrid/ReadingPassageGrid (ảnh 16:9 + tiêu đề + dòng phụ) để trang không
// nhảy khi dữ liệu về.
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1.5 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

// Cùng dáng thẻ danh sách bài học/bộ từ.
export function ListCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-karte border border-kartenrand bg-karteikarte p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-2/3" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

// --- Toast ---
const toastIcon: Record<ToastTone, ReactNode> = {
  info: <Info className="size-4.5 shrink-0 text-tinte" aria-hidden="true" />,
  ok: <CheckCircle2 className="size-4.5 shrink-0 text-aufstieg" aria-hidden="true" />,
  bad: <AlertTriangle className="size-4.5 shrink-0 text-rotstift" aria-hidden="true" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastInput & { id: number })[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), [])
  const show = useCallback((toast: ToastInput) => {
    const id = nextId.current++
    setToasts((list) => [...list.slice(-2), { ...toast, id }])
    window.setTimeout(() => dismiss(id), 4500)
  }, [dismiss])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-center gap-2 px-4 pb-safe">
        {toasts.map((toast) => (
          <div key={toast.id} role={toast.tone === 'bad' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-karte bg-karteikarte px-4 py-3 text-sm text-bleistift shadow-pop animate-sheet">
            {toastIcon[toast.tone ?? 'info']}
            <div className="min-w-0 flex-1">{toast.message}</div>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Đóng thông báo"
              className={cn('-mr-1 flex size-8 shrink-0 items-center justify-center rounded-karte text-radiert hover:text-bleistift', focusRing)}>
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
