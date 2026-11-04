import type { CSSProperties, ReactNode } from 'react'
import { Flame, GraduationCap, Layers, PencilLine } from 'lucide-react'
import { Article, Badge, ButtonLink, Card, TextLink } from '@kit'

const FEATURES: { icon: ReactNode; title: string; description: string; comingSoon?: boolean }[] = [
  {
    icon: <Layers />,
    title: 'Flashcard với SRS thông minh',
    description: 'Thuật toán lặp lại ngắt quãng (SM-2) tự động giãn lịch ôn theo mức độ nhớ của bạn, tập trung thời gian vào từ hay quên.',
  },
  {
    icon: <PencilLine />,
    title: 'Bộ từ tự tạo theo nhu cầu',
    description: 'Tự tạo bộ từ vựng riêng cho từng tình huống: phỏng vấn xin việc, nhập học, khám bệnh, làm giấy tờ...',
  },
  {
    icon: <Flame />,
    title: 'Streak giữ động lực học',
    description: 'Theo dõi chuỗi ngày học liên tục, nhận email nhắc nhở nếu chưa ôn từ trong ngày.',
  },
  {
    icon: <GraduationCap />,
    title: 'Luyện thi 4 kỹ năng',
    description: 'Mô phỏng sát format thi Goethe/telc/TestDaF: Nghe, Đọc, Viết, Nói - có chấm điểm và nhận xét.',
    comingSoon: true,
  },
]

/** Xấp thẻ Karteikarte minh hoạ cho phần đầu trang: chính là cách app hoạt động. */
function CardStack() {
  return (
    <div className="relative mx-auto h-48 w-full max-w-xs" aria-hidden="true">
      <div className="absolute inset-x-6 top-6 h-36 rotate-3 rounded-karte border border-kartenrand bg-karteikarte-innen" />
      <div className="absolute inset-x-3 top-3 h-36 -rotate-2 rounded-karte border border-kartenrand bg-karteikarte-innen" />
      <div className="absolute inset-x-0 top-0 flex h-36 flex-col rounded-karte border border-kartenrand bg-karteikarte lampenlicht shadow-lift">
        <div className="flex h-10 items-center justify-between border-b-2 border-kopfzeile px-4 text-xs text-hauch">
          <span>A1 · Behörde</span>
          <span>Ngăn 2</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center textur-linien">
          <p className="font-display text-2xl font-semibold text-bleistift"><Article gender="die" /> Anmeldung</p>
          <p className="mt-1 text-sm text-radiert">sự đăng ký cư trú</p>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-nav border-b border-kartenrand bg-karteikarte px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-seite items-center justify-between gap-4">
          <span className="shrink-0 font-display text-lg font-bold text-bleistift">
            Deutsch<span className="text-reiter-tief">Pfad</span>
          </span>
          <nav className="flex items-center gap-2 sm:gap-3">
            <ButtonLink to="/login" variant="ghost" size="sm">Đăng nhập</ButtonLink>
            <ButtonLink to="/register" size="sm">Đăng ký miễn phí</ButtonLink>
          </nav>
        </div>
      </header>

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-seite items-center gap-10 md:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="text-center md:text-left">
            <p className="mb-3 text-sm font-medium text-radiert">Học tiếng Đức cho người Việt</p>
            <h1 className="font-display text-4xl font-bold text-balance text-bleistift sm:text-5xl">
              Sẵn sàng cho hành trình du học và làm việc tại Đức
            </h1>
            <p className="mt-6 max-w-prose text-lg text-radiert md:mx-0 mx-auto">
              Học từ vựng, luyện nghe nói và chuẩn bị thi chứng chỉ Goethe, telc, TestDaF - tất cả
              trong một nền tảng dành riêng cho người Việt.
            </p>
            <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row md:mx-0 sm:justify-center md:justify-start">
              <ButtonLink to="/register">Bắt đầu học miễn phí</ButtonLink>
              <ButtonLink to="/login" variant="secondary">Đăng nhập</ButtonLink>
            </div>
          </div>
          <CardStack />
        </div>
      </section>

      <section className="mx-auto max-w-seite px-6 py-12">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-bleistift">Tính năng nổi bật</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <Card key={feature.title} style={{ '--stagger-index': i } as CSSProperties} className="stagger-in p-6">
              <span className="mb-3 flex size-10 items-center justify-center rounded-rund bg-karteikarte-innen text-radiert [&_svg]:size-5" aria-hidden="true">
                {feature.icon}
              </span>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="font-display font-semibold text-bleistift">{feature.title}</h3>
                {feature.comingSoon && <Badge>Sắp ra mắt</Badge>}
              </div>
              <p className="text-sm text-radiert">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 py-12">
        <Card variant="sunken" className="mx-auto max-w-lesen p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-bleistift">Nguồn nội dung uy tín</h2>
          <p className="mt-4 text-radiert">
            Từ vựng được biên soạn dựa trên Wortliste chính thức của Goethe-Institut - bộ từ
            vựng bắt buộc cho từng kỳ thi, đảm bảo bạn học đúng những gì cần cho kỳ thi thật.
          </p>
        </Card>
      </section>

      <section className="mx-auto max-w-lesen px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-bleistift">Bắt đầu học miễn phí ngay hôm nay</h2>
        <ButtonLink to="/register" className="mt-6">Đăng ký tài khoản</ButtonLink>
      </section>

      <footer className="border-t border-kartenrand bg-karteikarte px-6 py-8 text-center text-sm text-radiert">
        © {new Date().getFullYear()} DeutschPfad · <TextLink to="/login">Đăng nhập</TextLink>
      </footer>
    </div>
  )
}
