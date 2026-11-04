import type { ReactNode } from 'react'
import { Construction } from 'lucide-react'
import { ButtonLink, EmptyState } from '@kit'

export default function ComingSoonPage({ title, icon = <Construction /> }: { title: string; icon?: ReactNode }) {
  return (
    <div className="mx-auto max-w-lesen">
      <EmptyState icon={icon} title={title} description="Chức năng đang hoàn thiện, bạn quay lại sau nhé."
        action={<ButtonLink to="/app">Về trang chủ</ButtonLink>} />
    </div>
  )
}
