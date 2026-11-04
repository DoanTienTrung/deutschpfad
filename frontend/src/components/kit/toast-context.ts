import { createContext, useContext, type ReactNode } from 'react'

export type ToastTone = 'info' | 'ok' | 'bad'

export interface ToastInput {
  tone?: ToastTone
  message: ReactNode
}

export const ToastContext = createContext<((toast: ToastInput) => void) | null>(null)

/** Hiện thông báo ngắn ở cuối màn hình. Cần <ToastProvider> bọc ngoài app. */
export function useToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast cần <ToastProvider> bọc ngoài')
  return show
}
