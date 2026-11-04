import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Badge, CardButton, cn } from '@kit'

/** Một lựa chọn lớn ở trang tổng của từng kỹ năng (Nghe, Đọc, Viết...). */
export default function HubChoice({ to, icon, title, description, featured, comingSoon }: {
  to?: string
  icon: ReactNode
  title: string
  description: string
  /** Lựa chọn nên bắt đầu: mép chì than. */
  featured?: boolean
  comingSoon?: boolean
}) {
  const body = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-rund bg-karteikarte-innen text-radiert [&_svg]:size-5" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-bleistift">
          {title}
          {comingSoon && <Badge>Sắp ra mắt</Badge>}
        </span>
        <span className="mt-1 block text-sm text-radiert">{description}</span>
      </span>
      {to && <ArrowRight className="size-4 shrink-0 text-radiert transition-transform group-hover:translate-x-1" aria-hidden="true" />}
    </>
  )
  if (!to) {
    return <div className="flex items-start gap-4 rounded-karte border border-dashed border-kante p-5">{body}</div>
  }
  return (
    <CardButton to={to} className={cn('group flex items-start gap-4', featured && 'border-bleistift')}>
      {body}
    </CardButton>
  )
}
