import { Link } from 'react-router-dom'

export default function WritingHubPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-bold text-ink">Viết</h2>
      <p className="mt-1 mb-6 text-sm text-muted">
        Luyện dịch để đặt câu tiếng Đức cho đúng, rồi luyện viết bài hoàn chỉnh theo dạng đề thi.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/app/writing/translate"
          className="group flex flex-col rounded-xl bg-primary p-5 text-canvas transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas/15 text-xl" aria-hidden="true">
            🔁
          </span>
          <p className="mt-4 font-display text-lg font-semibold">Luyện dịch</p>
          <p className="mt-1 text-sm text-canvas/75">
            Dịch Việt → Đức theo từng chủ điểm ngữ pháp, chấm và chữa từng câu.
          </p>
          <span className="mt-4 text-sm font-semibold">
            Bắt đầu <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>

        <div className="flex flex-col rounded-xl border border-dashed border-hairline bg-surface p-5 text-ink">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-xl" aria-hidden="true">
            ✍️
          </span>
          <p className="mt-4 font-display text-lg font-semibold">Luyện viết</p>
          <p className="mt-1 text-sm text-muted">
            Viết email, bài diễn đàn, thư trang trọng theo đề thi Goethe, AI chấm và chữa bài.
          </p>
          <span className="mt-4 self-start rounded-full border border-hairline px-2.5 py-0.5 text-xs font-medium text-muted">
            Sắp ra mắt
          </span>
        </div>
      </div>
    </div>
  )
}
