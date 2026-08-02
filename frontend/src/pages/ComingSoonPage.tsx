import { Link } from 'react-router-dom'

export default function ComingSoonPage({ title, icon = '🚧' }: { title: string; icon?: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-md border border-dashed border-hairline p-12 text-center">
        <p className="text-4xl">{icon}</p>
        <h2 className="mt-3 font-display text-xl font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-muted">Chức năng đang hoàn thiện, bạn quay lại sau nhé.</p>
        <Link
          to="/app"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-canvas transition-colors hover:bg-primary-deep"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
