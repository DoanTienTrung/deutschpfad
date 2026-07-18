import { Link } from 'react-router-dom'

export default function ListeningHubPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
        🎧 Trung tâm luyện nghe
      </span>

      <h2 className="font-display text-3xl font-bold text-ink">
        Luyện <span className="text-accent-deep">nghe</span> tiếng Đức
      </h2>
      <p className="mt-2 text-sm text-muted">
        Luyện nghe qua video hội thoại YouTube theo chủ đề đời sống, hoặc luyện trực tiếp với dữ
        liệu đề thi mẫu chính thức Goethe-Institut để làm quen với đúng định dạng thi thật.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/app/listening/youtube"
          className="group flex items-center justify-between gap-3 rounded-lg bg-primary p-5 text-canvas shadow-lifted transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas/15 text-lg">
              📺
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide">Luyện qua Video YouTube</p>
              <p className="mt-0.5 text-xs text-canvas/70">Hội thoại đời sống, đủ mọi cấp độ</p>
            </div>
          </div>
          <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </Link>

        <Link
          to="/app/listening/exam"
          className="group flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface p-5 text-ink shadow-lifted transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/25 text-lg">
              📝
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide">Luyện qua Đề thi</p>
              <p className="mt-0.5 text-xs text-muted">Dữ liệu Modellsatz Goethe-Institut</p>
            </div>
          </div>
          <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  )
}
