import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn, focusRing } from './cn'
import { Button } from './basic'

// Dùng <dialog> gốc của trình duyệt: tự có lớp trên cùng, bẫy focus, Esc để đóng. Khi mở thì khoá cuộn trang.
function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => { root.style.overflow = previous }
  }, [open])
  return ref
}

function DialogTitleBar({ titleId, title, descriptionId, description, onClose }: {
  titleId: string; title: ReactNode; descriptionId: string; description?: ReactNode; onClose: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="min-w-0">
        <h2 id={titleId} className="font-display text-lg font-semibold text-bleistift">{title}</h2>
        {description && <p id={descriptionId} className="mt-1 text-sm text-radiert">{description}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label="Đóng"
        className={cn('-mt-1 -mr-2 flex size-10 shrink-0 items-center justify-center rounded-karte text-radiert hover:bg-karteikarte-innen hover:text-bleistift', focusRing)}>
        <X className="size-4.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export function Dialog({ open, onClose, title, description, children, footer, className }: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  /** Hàng nút cuối hộp thoại. */
  footer?: ReactNode
  className?: string
}) {
  const ref = useModal(open)
  const titleId = useId()
  const descriptionId = useId()
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose() }}
      aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}
      className={cn('m-auto w-[calc(100%-2rem)] max-w-md rounded-karte bg-karteikarte text-bleistift shadow-pop backdrop:bg-schleier open:animate-erscheinen', className)}>
      {open && (
        <>
          <DialogTitleBar titleId={titleId} title={title} descriptionId={descriptionId} description={description} onClose={onClose} />
          {children && <div className="px-5 pt-4 text-sm">{children}</div>}
          <div className="flex flex-wrap justify-end gap-2 px-5 pt-5 pb-5">{footer}</div>
        </>
      )}
    </dialog>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Đồng ý', cancelLabel = 'Huỷ', danger, loading }: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Hành động không hoàn tác được (xoá...): nút xác nhận màu đỏ. */
  danger?: boolean
  loading?: boolean
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      )} />
  )
}

/** Tấm trượt từ đáy lên trên điện thoại; từ màn sm trở lên là hộp thoại giữa màn. */
export function BottomSheet({ open, onClose, title, description, children, className }: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  const ref = useModal(open)
  const titleId = useId()
  const descriptionId = useId()
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose() }}
      aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}
      className={cn('mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-reiter bg-karteikarte text-bleistift shadow-pop backdrop:bg-schleier open:animate-sheet',
        'sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-lg sm:rounded-karte sm:open:animate-erscheinen', className)}>
      {open && (
        <>
          <div className="mx-auto mt-2 h-1 w-10 rounded-rund bg-linie sm:hidden" aria-hidden="true" />
          <DialogTitleBar titleId={titleId} title={title} descriptionId={descriptionId} description={description} onClose={onClose} />
          <div className="px-5 pt-4 pb-safe text-sm">{children}</div>
        </>
      )}
    </dialog>
  )
}

/** Ngăn kéo trượt từ cạnh trái (menu trên điện thoại). */
export function Drawer({ open, onClose, label, children, className }: {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}) {
  const ref = useModal(open)
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose() }} aria-label={label}
      className={cn('m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-karteikarte text-bleistift shadow-pop backdrop:bg-schleier open:animate-drawer', className)}>
      {open && children}
    </dialog>
  )
}

// --- Đóng khi bấm ra ngoài hoặc Esc (menu, popover) ---
function useDismiss(open: boolean, close: () => void) {
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) close() }
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, close])
  return rootRef
}

export interface MenuItem {
  label: ReactNode
  onSelect: () => void
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
}

export function DropdownMenu({ label, trigger, items, align = 'end' }: {
  /** Tên của nút mở menu cho trình đọc màn hình. */
  label: string
  /** Nội dung hiện trên nút mở (chữ hoặc icon). */
  trigger: ReactNode
  items: MenuItem[]
  align?: 'start' | 'end'
}) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const close = () => { setOpen(false); buttonRef.current?.focus() }
  const rootRef = useDismiss(open, () => setOpen(false))

  function focusItem(index: number) {
    const nodes = rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])')
    if (!nodes?.length) return
    nodes[(index + nodes.length) % nodes.length].focus()
  }
  function onMenuKey(e: KeyboardEvent<HTMLDivElement>) {
    const nodes = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? [])
    const current = nodes.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(current + 1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(current - 1) }
    else if (e.key === 'Home') { e.preventDefault(); focusItem(0) }
    else if (e.key === 'End') { e.preventDefault(); focusItem(nodes.length - 1) }
    else if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'Tab') setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button ref={buttonRef} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
        onClick={() => { setOpen((v) => !v); if (!open) requestAnimationFrame(() => focusItem(0)) }}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true); requestAnimationFrame(() => focusItem(0)) } }}
        className={cn('inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-karte px-2 text-sm font-medium text-bleistift hover:bg-bleistift/5', focusRing)}>
        {trigger}
      </button>
      {open && (
        <div id={menuId} role="menu" aria-label={label} onKeyDown={onMenuKey}
          className={cn('absolute top-full z-popover mt-1 min-w-48 rounded-karte bg-karteikarte p-1 shadow-pop animate-erscheinen', align === 'end' ? 'right-0' : 'left-0')}>
          {items.map((item, index) => (
            <button key={index} type="button" role="menuitem" disabled={item.disabled} tabIndex={-1}
              onClick={() => { item.onSelect(); setOpen(false) }}
              className={cn('flex min-h-10 w-full items-center gap-2.5 rounded-karte px-3 text-left text-sm hover:bg-karteikarte-innen focus-visible:bg-karteikarte-innen focus-visible:outline-none disabled:opacity-50 [&_svg]:size-4',
                item.danger ? 'text-rotstift' : 'text-bleistift')}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Popover({ trigger, label, children, align = 'start', className }: {
  trigger: ReactNode
  label: string
  children: ReactNode
  align?: 'start' | 'end'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useDismiss(open, () => setOpen(false))
  return (
    <div ref={rootRef} className="relative inline-flex">
      <button type="button" aria-label={label} aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={() => setOpen((v) => !v)}
        className={cn('inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-karte px-2 text-sm font-medium text-bleistift hover:bg-bleistift/5', focusRing)}>
        {trigger}
      </button>
      {open && (
        <div id={panelId} role="dialog" aria-label={label}
          className={cn('absolute top-full z-popover mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-karte bg-karteikarte p-4 text-sm text-bleistift shadow-pop animate-erscheinen',
            align === 'end' ? 'right-0' : 'left-0', className)}>
          {children}
        </div>
      )}
    </div>
  )
}
