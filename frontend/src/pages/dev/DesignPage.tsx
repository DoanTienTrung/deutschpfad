import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Switch } from '@kit'
import { applyTheme, getThemePreference } from '../../lib/theme'
import KitCatalog from './KitCatalog'

// Trang duyệt design system (chỉ có ở bản dev, route /design). GĐ 1: hiện mọi token trong
// src/styles/tokens.css ở cả hai cảnh, kèm tỉ lệ tương phản đo trực tiếp từ giá trị đang chạy.
// Chưa có Tailwind cho token (GĐ 2) nên trang đọc biến bằng style={{ ... var(--x) }}.

type Theme = 'light' | 'dark'

const v = (name: string) => `var(--${name})`

// --- Tương phản WCAG, tính từ oklch(L C H) mà trình duyệt trả về cho biến ---
function luminance(oklch: string): number | null {
  const m = oklch.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/)
  if (!m) return null
  const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1])
  const C = parseFloat(m[2])
  const H = (parseFloat(m[3]) * Math.PI) / 180
  const a = C * Math.cos(H)
  const b = C * Math.sin(H)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (x: number) => Math.min(1, Math.max(0, x))
  const r = clamp(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s)
  const g = clamp(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s)
  const bl = clamp(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s)
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl
}

function contrast(fg: string, bg: string): number | null {
  const style = getComputedStyle(document.documentElement)
  const a = luminance(style.getPropertyValue(`--${fg}`))
  const b = luminance(style.getPropertyValue(`--${bg}`))
  if (a === null || b === null) return null
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function Ratio({ fg, bg, min = 4.5 }: { fg: string; bg: string; min?: number }) {
  const value = contrast(fg, bg)
  if (value === null) return null
  const pass = value >= min
  return (
    <span className="px-1.5 py-0.5 font-mono text-xs font-semibold"
      style={{ color: v(pass ? 'aufstieg' : 'rotstift'), background: v(pass ? 'aufstieg-soft' : 'rotstift-soft'), borderRadius: v('ecke-karte') }}
      title={`Cần tối thiểu ${min}:1`}>
      {value.toFixed(1)}:1 {pass ? 'đạt' : 'chưa đạt'}
    </span>
  )
}

// --- Khung trình bày ---
const card: CSSProperties = {
  backgroundColor: v('karteikarte'),
  backgroundImage: v('lampenlicht'),
  border: `1px solid ${v('kartenrand')}`,
  borderRadius: v('ecke-karte'),
  boxShadow: v('schatten-lift'),
}

const nested: CSSProperties = {
  background: v('karteikarte-innen'),
  border: `1px solid ${v('linie')}`,
  borderRadius: v('ecke-karte'),
}

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24" style={card}>
      <header className="flex h-14 items-center px-5" style={{ borderBottom: `2px solid ${v('kopfzeile')}` }}>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </header>
      <div className="space-y-4 px-5 pt-3 pb-5">
        <p className="text-sm" style={{ color: v('radiert') }}>{intro}</p>
        {children}
      </div>
    </section>
  )
}

function Swatch({ name, role }: { name: string; role: string }) {
  return (
    <div className="min-w-0">
      <div className="h-11" style={{ background: v(name), border: `1px solid ${v('linie')}`, borderRadius: v('ecke-karte') }} />
      <p className="mt-1.5 font-mono text-xs break-all">--{name}</p>
      <p className="text-xs" style={{ color: v('hauch') }}>{role}</p>
    </div>
  )
}

function SwatchGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([name, role]) => <Swatch key={name} name={name} role={role} />)}
    </div>
  )
}

const SECTIONS = [
  ['be-mat', 'Mặt bàn và thẻ'],
  ['chu', 'Chữ'],
  ['duong-ke', 'Đường kẻ'],
  ['trang-thai', 'Trạng thái'],
  ['giong', 'Giống danh từ'],
  ['ngan', 'Ngăn hộp'],
  ['bong', 'Bóng'],
  ['bo-goc', 'Bo góc'],
  ['lop-phu', 'Lớp phủ'],
  ['texture', 'Texture'],
  ['chieu-rong', 'Chiều rộng trang'],
] as const

const KIT_SECTIONS = [
  ['k-co-ban', 'Nút'],
  ['k-form', 'Ô nhập và chọn'],
  ['k-bo-cuc', 'Bố cục, thẻ'],
  ['k-hien-thi', 'Nhãn, số liệu, bảng'],
  ['k-phan-hoi', 'Phản hồi'],
  ['k-bam', 'Bề mặt bấm được'],
  ['k-lop-phu', 'Lớp phủ'],
  ['k-dieu-huong', 'Điều hướng'],
  ['k-nghiep-vu', 'Nghiệp vụ DeutschPfad'],
] as const

const STATES: { name: string; label: string; sample: string }[] = [
  { name: 'reiter', label: 'Nhấn mạnh: tab hổ phách, chỉ cho thứ đã đạt', sample: 'Bạn đã ôn đủ 7 ngày liền.' },
  { name: 'aufstieg', label: 'Đúng: thẻ lên ngăn', sample: 'Chính xác. Thẻ lên ngăn 3.' },
  { name: 'rotstift', label: 'Sai: bút đỏ, thẻ về ngăn 1', sample: 'Chưa đúng. Termin là der, Akkusativ thành einen.' },
  { name: 'tinte', label: 'Thông tin: mực xanh ghi chú', sample: 'Bài nghe mới: 12 video hội thoại A2.' },
]

const FAECHER = [
  ['fach-1', 'Chưa nhớ', 'mới gặp hoặc vừa quên', 42],
  ['fach-2', 'Đang học', 'nhớ được 1 lần', 68],
  ['fach-3', 'Đã thuộc', 'nhớ đúng từ 2 lần', 115],
  ['fach-4', 'Nhớ lâu', 'lịch ôn cách từ 3 tuần', 160],
] as const

export default function DesignPage() {
  const [texture, setTexture] = useState(true)
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')

  // Đổi cảnh chỉ để xem, không lưu. Gắn lên <html> ngay khi bấm (trước khi vẽ lại) để số tương phản
  // đọc đúng cảnh mới. Rời trang thì trả về lựa chọn thật của người dùng.
  function switchTheme(next: Theme) {
    applyTheme(next)
    setTheme(next)
  }
  useEffect(() => () => applyTheme(getThemePreference()), [])

  return (
    <div className="min-h-screen font-sans" style={{
      background: v('pappe'), backgroundImage: texture ? v('textur-pappe') : 'none', backgroundSize: v('textur-pappe-groesse'), color: v('bleistift'),
    }}>
      <div className="sticky top-0 z-20" style={{ background: v('karteikarte'), borderBottom: `1px solid ${v('kartenrand')}` }}>
        <div className="mx-auto flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3" style={{ maxWidth: v('seitenbreite') }}>
          <div className="mr-auto">
            <p className="font-display font-semibold">Design system DeutschPfad</p>
            <p className="text-xs" style={{ color: v('hauch') }}>Token: src/styles/tokens.css · Component: src/components/kit (import từ @kit). Trang chỉ có ở bản dev.</p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Cảnh">
            {(['light', 'dark'] as const).map((t) => (
              <button key={t} type="button" aria-pressed={theme === t} onClick={() => switchTheme(t)}
                className="min-h-11 px-4 text-sm font-semibold"
                style={theme === t
                  ? { background: v('bleistift'), color: v('bleistift-invers'), borderRadius: v('ecke-karte'), boxShadow: v('schatten-offset') }
                  : { background: v('karteikarte'), color: v('bleistift'), border: `1px solid ${v('kante')}`, borderRadius: v('ecke-karte') }}>
                {t === 'light' ? 'Ban ngày' : 'Đèn bàn ban đêm'}
              </button>
            ))}
          </div>
          <Switch label="Texture nền" checked={texture} onChange={setTexture} className="min-w-40" />
          <Link to="/app" className="text-sm font-semibold underline underline-offset-4">Về app</Link>
        </div>
      </div>

      <div className="mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[12rem_minmax(0,1fr)]" style={{ maxWidth: v('seitenbreite') }}>
        <nav aria-label="Mục lục" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {[...SECTIONS, ...KIT_SECTIONS].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="inline-flex min-h-9 items-center px-3 text-sm font-medium"
                  style={{ background: v('karteikarte'), border: `1px solid ${v('kartenrand')}`, borderRadius: `${v('ecke-reiter')} ${v('ecke-reiter')} 0 0` }}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 space-y-6">
          <Section id="be-mat" title="Mặt bàn và thẻ" intro="Ba bậc bề mặt. Mặt bàn đậm hơn thẻ để thẻ nổi lên; thẻ lồng trong thẻ tự nhẹ đi: viền kẻ nhạt, không bóng. Ban đêm thẻ còn có --lampenlicht: ánh đèn rọi từ trên làm mép trên sáng hơn.">
            <SwatchGrid items={[['pappe', 'Mặt bàn'], ['pappe-dunkel', 'Bìa khuất, bóng nút'], ['karteikarte', 'Thẻ'], ['karteikarte-innen', 'Thẻ lồng, vùng lõm']]} />
            <div className="p-5" style={{ background: v('pappe'), backgroundImage: v('textur-pappe'), backgroundSize: v('textur-pappe-groesse'), borderRadius: v('ecke-karte') }}>
              <div className="max-w-md p-4" style={card}>
                <p className="font-semibold">Thẻ nằm trên mặt bàn</p>
                <div className="mt-3 p-3" style={nested}>
                  <p className="text-sm">Thẻ lồng bên trong: viền --linie, không bóng.</p>
                </div>
              </div>
            </div>
          </Section>

          <Section id="chu" title="Chữ" intro="Ba bậc chữ và chữ trên nền chì than. Số bên cạnh là tương phản đo từ giá trị đang chạy (cần 4,5:1).">
            <div className="space-y-3">
              {([['bleistift', 'Chữ chính'], ['radiert', 'Chữ phụ'], ['hauch', 'Chữ mờ']] as const).map(([ink, role]) => (
                <div key={ink} className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
                  <p className="font-mono text-xs">--{ink}<span className="block font-sans" style={{ color: v('hauch') }}>{role}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {(['karteikarte', 'karteikarte-innen', 'pappe'] as const).map((bg) => (
                      <div key={bg} className="flex items-center gap-2 px-3 py-2" style={{ background: v(bg), border: `1px solid ${v('linie')}`, borderRadius: v('ecke-karte') }}>
                        <span style={{ color: v(ink) }}>die Anmeldung</span>
                        <Ratio fg={ink} bg={bg} min={ink === 'hauch' && bg === 'pappe' ? 3 : 4.5} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
                <p className="font-mono text-xs">--bleistift-invers<span className="block font-sans" style={{ color: v('hauch') }}>Chữ trên nền chì than</span></p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex min-h-11 items-center px-4 font-semibold"
                    style={{ background: v('bleistift'), color: v('bleistift-invers'), borderRadius: v('ecke-karte'), boxShadow: v('schatten-offset') }}>
                    Bắt đầu ôn
                  </span>
                  <Ratio fg="bleistift-invers" bg="bleistift" />
                </div>
              </div>
            </div>
            <p className="text-xs" style={{ color: v('hauch') }}>Chữ mờ chỉ đặt trên thẻ; trên mặt bàn nó chỉ đạt mức chữ lớn (3:1).</p>
          </Section>

          <Section id="duong-ke" title="Đường kẻ" intro="Hai bậc kẻ, mép thẻ và dòng đỏ đầu thẻ. Kẻ đậm đạt 3:1 trên thẻ để viền ô nhập đủ rõ; mép thẻ tách riêng để ban đêm thẻ không bị viền cứng.">
            <SwatchGrid items={[['linie', 'Kẻ nhạt: dòng kẻ, đường chia'], ['kante', 'Kẻ đậm: viền ô nhập, nút phụ'], ['kartenrand', 'Mép thẻ (ban đêm chìm vào bóng)'], ['kopfzeile', 'Dòng đỏ đầu thẻ (trang trí)']]} />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span>Kẻ đậm trên thẻ</span><Ratio fg="kante" bg="karteikarte" min={3} />
            </div>
            <div className="space-y-3 text-sm">
              <div style={{ borderTop: `1px solid ${v('linie')}` }} />
              <div style={{ borderTop: `1px solid ${v('kante')}` }} />
              <div style={{ borderTop: `2px solid ${v('kopfzeile')}` }} />
            </div>
          </Section>

          <Section id="trang-thai" title="Trạng thái" intro="Mỗi trạng thái có bản đặc và bản nền nhạt. Chữ màu đặc trên nền nhạt của chính nó phải đạt 4,5:1.">
            <div className="grid gap-4 sm:grid-cols-2">
              {STATES.map((state) => (
                <div key={state.name} className="space-y-2">
                  <p className="text-sm font-semibold">{state.label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Swatch name={state.name} role="Đặc" />
                    <Swatch name={`${state.name}-soft`} role="Nền nhạt" />
                  </div>
                  {state.name === 'reiter' ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex min-h-9 items-center px-4 text-sm font-bold"
                        style={{ background: v('reiter'), color: v('reiter-beschriftung'), borderRadius: `${v('ecke-reiter')} ${v('ecke-reiter')} 0 0` }}>
                        12 ngày liền mở hộp
                      </span>
                      <Ratio fg="reiter-beschriftung" bg="reiter" />
                      <span className="inline-flex min-h-9 items-center px-4 text-sm font-bold"
                        style={{ background: v('reiter-tief'), color: v('reiter-beschriftung'), borderRadius: `${v('ecke-reiter')} ${v('ecke-reiter')} 0 0` }}>
                        Khi nhấn
                      </span>
                      <Ratio fg="reiter-beschriftung" bg="reiter-tief" />
                    </div>
                  ) : (
                    <div className="px-3 py-2.5 text-sm" style={{ background: v(`${state.name}-soft`), border: `1px solid ${v(state.name)}`, borderRadius: v('ecke-karte') }}>
                      <p style={{ color: v(state.name) }} className="font-semibold">{state.sample}</p>
                      <div className="mt-1.5 flex flex-wrap gap-2"><Ratio fg={state.name} bg={`${state.name}-soft`} /><Ratio fg={state.name} bg="karteikarte" /></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex min-h-11 items-center px-4 font-semibold"
                style={{ background: v('karteikarte'), border: `1px solid ${v('kante')}`, borderRadius: v('ecke-karte'), outline: `2px solid ${v('fokus')}`, outlineOffset: '2px' }}>
                Vòng focus (--fokus)
              </span>
              <Ratio fg="fokus" bg="pappe" min={3} />
            </div>
          </Section>

          <Section id="giong" title="Giống danh từ" intro="Ba màu tab như thẻ từ của học sinh Đức. Giữ đúng giá trị đang dùng trong app.">
            <div className="grid gap-3 sm:grid-cols-3">
              {([['der', 'Termin'], ['die', 'Anmeldung'], ['das', 'Formular']] as const).map(([g, noun]) => (
                <div key={g} className="space-y-2">
                  <span className="inline-flex min-h-9 items-center px-4 text-sm font-bold"
                    style={{ background: v(`reiter-${g}-soft`), color: v(`reiter-${g}`), borderRadius: `${v('ecke-reiter')} ${v('ecke-reiter')} 0 0`, borderBottom: `2px solid ${v(`reiter-${g}`)}` }}>
                    {g}
                  </span>
                  <p className="text-lg"><span className="font-bold" style={{ color: v(`reiter-${g}`) }}>{g}</span> {noun}</p>
                  <div className="flex flex-wrap gap-2"><Ratio fg={`reiter-${g}`} bg="karteikarte" /><Ratio fg={`reiter-${g}`} bg={`reiter-${g}-soft`} /></div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="ngan" title="Ngăn hộp" intro="Bốn mức nhớ thật của app, từ Chưa nhớ tới Nhớ lâu. Cùng họ màu với Đúng; ở cảnh tối nhớ lâu là sáng nhất.">
            <div className="grid grid-cols-4 gap-2">
              {FAECHER.map(([name, label, hint, count]) => (
                <div key={name} className="flex min-w-0 flex-col">
                  <div className="flex h-28 flex-col justify-end p-1.5" style={{ ...nested, borderTop: 'none', borderRadius: `0 0 ${v('ecke-karte')} ${v('ecke-karte')}` }}>
                    <div style={{ height: `${Math.round((count / 160) * 88)}px`, background: v(name), borderRadius: '1px' }} />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold">{label}</p>
                  <p className="text-xs" style={{ color: v('hauch') }}>{hint}</p>
                  <p className="mt-1 font-mono text-xs">--{name}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="bong" title="Bóng" intro="Ba vai: nhấc nhẹ là thẻ nằm trên một thẻ khác, lớp nổi cho hộp thoại và menu, bóng lệch cứng cho nút.">
            <div className="grid gap-6 p-4 sm:grid-cols-3" style={{ background: v('pappe'), borderRadius: v('ecke-karte') }}>
              {([['schatten-lift', 'Nhấc nhẹ'], ['schatten-pop', 'Lớp nổi'], ['schatten-offset', 'Bóng lệch']] as const).map(([name, role]) => (
                <div key={name} className="flex h-24 flex-col justify-center px-4"
                  style={{ background: v('karteikarte'), borderRadius: v('ecke-karte'), boxShadow: v(name), border: name === 'schatten-pop' ? 'none' : `1px solid ${v('kante')}` }}>
                  <p className="font-semibold">{role}</p>
                  <p className="font-mono text-xs" style={{ color: v('radiert') }}>--{name}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="bo-goc" title="Bo góc" intro="Ba bậc có tên. Góc giấy cho thẻ, ô nhập và nút; tab bo hai góc trên; tròn hẳn cho chấm và ảnh đại diện.">
            <div className="flex flex-wrap items-end gap-6">
              <div className="space-y-1.5">
                <div className="h-16 w-28" style={{ background: v('karteikarte-innen'), border: `1px solid ${v('kante')}`, borderRadius: v('ecke-karte') }} />
                <p className="font-mono text-xs">--ecke-karte</p>
              </div>
              <div className="space-y-1.5">
                <div className="h-16 w-28" style={{ background: v('karteikarte-innen'), border: `1px solid ${v('kante')}`, borderBottom: 'none', borderRadius: `${v('ecke-reiter')} ${v('ecke-reiter')} 0 0` }} />
                <p className="font-mono text-xs">--ecke-reiter</p>
              </div>
              <div className="space-y-1.5">
                <div className="size-16" style={{ background: v('karteikarte-innen'), border: `1px solid ${v('kante')}`, borderRadius: v('ecke-rund') }} />
                <p className="font-mono text-xs">--ecke-rund</p>
              </div>
            </div>
          </Section>

          <Section id="lop-phu" title="Lớp phủ" intro="Lớp phủ dưới hộp thoại đủ tối để nội dung phía sau lùi hẳn; hộp thoại dùng bóng lớp nổi.">
            <div className="relative overflow-hidden p-4" style={{ background: v('pappe'), borderRadius: v('ecke-karte') }}>
              <div className="space-y-2 p-4" style={card}>
                <p className="font-semibold">Nội dung phía sau</p>
                <p className="text-sm" style={{ color: v('radiert') }}>Danh sách thẻ cần ôn hôm nay, 24 thẻ.</p>
                <p className="text-sm" style={{ color: v('radiert') }}>Die Anmeldung, der Termin, das Formular.</p>
              </div>
              <div className="absolute inset-0 grid place-items-center p-4" style={{ background: v('schleier') }}>
                <div role="presentation" className="w-full max-w-xs p-4" style={{ background: v('karteikarte'), borderRadius: v('ecke-karte'), boxShadow: v('schatten-pop') }}>
                  <p className="font-semibold">Dừng buổi ôn?</p>
                  <p className="mt-1 text-sm" style={{ color: v('radiert') }}>Thẻ đã chấm vẫn được lưu.</p>
                </div>
              </div>
            </div>
            <p className="font-mono text-xs">--schleier</p>
          </Section>

          <Section id="texture" title="Texture" intro="Mặt bàn có bản riêng cho từng cảnh: sợi bìa ban ngày; ban đêm là vệt phản chiếu của đèn trên mặt sơn đen bóng, phủ một lớp hạt rất mịn để chuyển màu không thành vệt. Dòng kẻ trên thẻ tự đổi màu theo --linie.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="h-40" style={{ background: v('pappe'), backgroundImage: v('textur-pappe'), backgroundSize: v('textur-pappe-groesse'), border: `1px solid ${v('kante')}`, borderRadius: v('ecke-karte') }} />
                <p className="font-mono text-xs">--textur-pappe</p>
              </div>
              <div className="space-y-1.5">
                <div className="h-40 px-4 pt-3" style={{ ...card, boxShadow: 'none', backgroundImage: v('textur-linien'), backgroundSize: v('textur-linien-groesse') }}>
                  <p className="leading-8">die Anmeldung, -en</p>
                  <p className="leading-8" style={{ color: v('radiert') }}>sự đăng ký (cư trú)</p>
                </div>
                <p className="font-mono text-xs">--textur-linien</p>
              </div>
            </div>
          </Section>

          <Section id="chieu-rong" title="Chiều rộng trang" intro="Hai chiều rộng cột nội dung là biến, thay cho max-w-5xl, max-w-3xl rải rác trong app.">
            <div className="space-y-3">
              <div className="h-8 px-3 text-xs leading-8" style={{ maxWidth: v('seitenbreite'), background: v('karteikarte-innen'), border: `1px dashed ${v('kante')}` }}>
                --seitenbreite: trang tổng, danh sách
              </div>
              <div className="h-8 px-3 text-xs leading-8" style={{ maxWidth: v('seitenbreite-lesen'), background: v('karteikarte-innen'), border: `1px dashed ${v('kante')}` }}>
                --seitenbreite-lesen: trang đọc, làm bài
              </div>
            </div>
          </Section>

          <h2 className="pt-4 font-display text-2xl font-bold">Bộ component</h2>
          <KitCatalog />
        </main>
      </div>
    </div>
  )
}
