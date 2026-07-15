import { Link } from 'react-router-dom'

const FEATURES = [
  {
    title: 'Flashcard với SRS thông minh',
    description: 'Thuật toán lặp lại ngắt quãng (SM-2) tự động giãn lịch ôn theo mức độ nhớ của bạn, tập trung thời gian vào từ hay quên.',
  },
  {
    title: 'Bộ từ tự tạo theo nhu cầu',
    description: 'Tự tạo bộ từ vựng riêng cho từng tình huống: phỏng vấn xin việc, nhập học, khám bệnh, làm giấy tờ...',
  },
  {
    title: 'Streak giữ động lực học',
    description: 'Theo dõi chuỗi ngày học liên tục, nhận email nhắc nhở nếu chưa ôn từ trong ngày.',
  },
  {
    title: 'Luyện thi 4 kỹ năng',
    description: 'Mô phỏng sát format thi Goethe/telc/TestDaF: Nghe, Đọc, Viết, Nói — có chấm điểm và nhận xét.',
    comingSoon: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-display text-lg font-bold text-ink">DeutschPfad</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-primary hover:text-primary-deep">
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="rounded-sm bg-primary px-4 py-2 font-medium text-canvas hover:bg-primary-deep"
            >
              Đăng ký miễn phí
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-6 h-40 w-40 rounded-full bg-accent/10" />
          <div className="absolute right-8 top-0 h-0 w-0 border-x-[70px] border-b-[120px] border-x-transparent border-b-primary/10" />
          <div className="absolute bottom-4 left-1/4 h-24 w-24 rotate-12 bg-accent/10" />
          <div className="absolute -right-10 bottom-0 h-32 w-32 rounded-full border-4 border-primary/10" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-medium text-accent-deep">Học tiếng Đức cho người Việt</p>
          <h1 className="font-display text-4xl font-bold text-balance text-ink sm:text-5xl">
            Sẵn sàng cho hành trình du học và làm việc tại Đức
          </h1>
          <p className="mt-6 text-lg text-muted">
            Học từ vựng, luyện nghe nói và chuẩn bị thi chứng chỉ Goethe, telc, TestDaF — tất cả
            trong một nền tảng dành riêng cho người Việt.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/register"
              className="rounded-sm bg-primary px-6 py-3 font-medium text-canvas hover:bg-primary-deep"
            >
              Bắt đầu học miễn phí
            </Link>
            <Link
              to="/login"
              className="rounded-sm border border-hairline px-6 py-3 font-medium text-ink hover:bg-surface"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-ink">Tính năng nổi bật</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-md border border-hairline bg-surface p-6">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-display font-semibold text-ink">{feature.title}</h3>
                {feature.comingSoon && (
                  <span className="rounded-sm bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-deep">
                    Sắp ra mắt
                  </span>
                )}
              </div>
              <p className="text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-hairline bg-surface px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-bold text-ink">Nguồn nội dung uy tín</h2>
          <p className="mt-4 text-muted">
            Từ vựng được biên soạn dựa trên Wortliste chính thức của Goethe-Institut — bộ từ
            vựng bắt buộc cho từng kỳ thi, đảm bảo bạn học đúng những gì cần cho kỳ thi thật.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">Bắt đầu học miễn phí ngay hôm nay</h2>
        <Link
          to="/register"
          className="mt-6 inline-block rounded-sm bg-primary px-6 py-3 font-medium text-canvas hover:bg-primary-deep"
        >
          Đăng ký tài khoản
        </Link>
      </section>

      <footer className="border-t border-hairline px-6 py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} DeutschPfad
      </footer>
    </div>
  )
}
