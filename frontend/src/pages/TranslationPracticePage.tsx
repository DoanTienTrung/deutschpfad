import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  checkTranslation,
  getTranslationSet,
  type TranslationCheckResult,
  type TranslationItem,
  type TranslationSetDetail,
  type TranslationVerdict,
} from '../api/translationApi'
import ListeningBreadcrumb from '../components/listening/ListeningBreadcrumb'
import Alert from '../components/ui/Alert'
import SpeakerIcon from '../components/ui/SpeakerIcon'
import { speak } from '../lib/speech'
import { diffWords, firstLetterHint, wordBankTokens } from '../lib/wordDiff'

type InputMode = 'WORD_BANK' | 'TYPING'

const MODE_STORAGE_KEY = 'deutschpfad.translateMode'
const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

const passed = (v: TranslationVerdict | null | undefined) => v === 'CORRECT' || v === 'ALMOST'

function readStoredMode(): InputMode | null {
  try {
    const v = localStorage.getItem(MODE_STORAGE_KEY)
    return v === 'WORD_BANK' || v === 'TYPING' ? v : null
  } catch {
    return null
  }
}

/** Lượt luyện: các câu chưa từng làm đúng trước; làm đúng hết rồi thì ôn lại cả bài. */
function buildQueue(set: TranslationSetDetail): number[] {
  const open = set.items.map((it, i) => (passed(it.lastVerdict) ? -1 : i)).filter((i) => i >= 0)
  return open.length > 0 ? open : set.items.map((_, i) => i)
}

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/[.!?…]+$/, '')

export default function TranslationPracticePage() {
  const { setId } = useParams()
  const [set, setSet] = useState<TranslationSetDetail | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [queue, setQueue] = useState<number[]>([])
  const [pos, setPos] = useState(0)
  const [mode, setMode] = useState<InputMode>('WORD_BANK')
  const [typed, setTyped] = useState('')
  const [picked, setPicked] = useState<number[]>([])
  const [hintLevel, setHintLevel] = useState(0)
  const [result, setResult] = useState<TranslationCheckResult | null>(null)
  const [submitted, setSubmitted] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outcomes, setOutcomes] = useState<Record<number, TranslationVerdict>>({})
  const [showNote, setShowNote] = useState(true)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    getTranslationSet(Number(setId))
      .then((s) => {
        setSet(s)
        setQueue(buildQueue(s))
        setMode(readStoredMode() ?? (s.level === 'A1' || s.level === 'A2' ? 'WORD_BANK' : 'TYPING'))
      })
      .catch(() => setLoadError(true))
  }, [setId])

  const finished = set !== null && queue.length > 0 && pos >= queue.length
  const item: TranslationItem | null = set && !finished && queue.length > 0 ? set.items[queue[pos]] : null
  const tokens = useMemo(() => (item ? wordBankTokens(item.deReference, item.id) : []), [item])
  const answer = mode === 'WORD_BANK' ? picked.map((i) => tokens[i]).join(' ') : typed

  useEffect(() => {
    if (result) nextRef.current?.focus()
    else if (mode === 'TYPING') inputRef.current?.focus()
  }, [result, mode, pos])

  // Xếp từ: Backspace bỏ từ vừa chọn, Enter để kiểm tra (không cần chuột).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (mode !== 'WORD_BANK' || result || checking) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Backspace' && picked.length > 0) {
        e.preventDefault()
        setPicked((p) => p.slice(0, -1))
      } else if (e.key === 'Enter' && picked.length > 0 && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        submit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function changeMode(next: InputMode) {
    setMode(next)
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next)
    } catch {
      // không lưu được lựa chọn thì thôi, lần sau dùng mặc định theo cấp độ
    }
  }

  async function submit(reveal = false) {
    if (!item || checking || result) return
    if (!reveal && !answer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const r = await checkTranslation(item.id, reveal ? null : answer, reveal ? 'REVEAL' : mode)
      setSubmitted(reveal ? '' : answer)
      setResult(r)
      setOutcomes((o) => ({ ...o, [item.id]: r.verdict }))
    } catch {
      setError('Không gửi được bản dịch, thử lại nhé.')
    } finally {
      setChecking(false)
    }
  }

  function next() {
    setResult(null)
    setTyped('')
    setPicked([])
    setHintLevel(0)
    setSubmitted('')
    setPos((p) => p + 1)
  }

  function retryWrong() {
    if (!set) return
    const wrong = queue.filter((i) => !passed(outcomes[set.items[i].id]))
    setQueue(wrong.length > 0 ? wrong : set.items.map((_, i) => i))
    setOutcomes({})
    setPos(0)
  }

  function insertChar(char: string) {
    const el = inputRef.current
    const start = el?.selectionStart ?? typed.length
    const end = el?.selectionEnd ?? typed.length
    setTyped(typed.slice(0, start) + char + typed.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + char.length, start + char.length)
    })
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert tone="danger">Không tải được bài luyện dịch.</Alert>
      </div>
    )
  }
  if (!set) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-10 animate-pulse rounded-lg bg-surface" />
        <div className="h-72 animate-pulse rounded-xl bg-surface" />
      </div>
    )
  }

  const listLink = `/app/writing/translate?level=${set.level}`

  return (
    // pb-24 trên điện thoại: nút gia sư nổi ở góc dưới không che mất nút "Kiểm tra".
    <div className="mx-auto max-w-2xl pb-24 sm:pb-0">
      <ListeningBreadcrumb
        items={[
          { label: 'Viết', to: '/app/writing' },
          { label: 'Luyện dịch', to: listLink },
          { label: set.title },
        ]}
      />

      <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-ink">{set.title}</h2>
          {set.subtitle && <p className="text-sm text-muted">{set.subtitle} · {set.level}</p>}
        </div>
        {set.grammarSlug && (
          <Link to={`/app/grammar/${set.grammarSlug}`} className="text-sm font-semibold text-primary hover:underline">
            Xem lại lý thuyết →
          </Link>
        )}
      </header>

      {set.structureNote && (
        <div className="mb-5 rounded-lg bg-surface px-4 py-3 text-sm">
          <button
            onClick={() => setShowNote((v) => !v)}
            aria-expanded={showNote}
            className="flex w-full items-center justify-between text-left font-semibold text-ink"
          >
            Công thức
            <span className="text-xs font-medium text-muted">{showNote ? 'Ẩn' : 'Hiện'}</span>
          </button>
          {showNote && <p className="mt-1 leading-relaxed text-ink">{set.structureNote}</p>}
        </div>
      )}

      {finished ? (
        <Summary
          queue={queue.map((i) => set.items[i])}
          outcomes={outcomes}
          listLink={listLink}
          onRetryWrong={retryWrong}
        />
      ) : (
        item && (
          <>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">
                  Câu {pos + 1} <span className="font-normal text-muted">/ {queue.length}</span>
                </span>
                <div className="flex rounded-full border border-hairline bg-surface p-0.5 text-xs font-medium" role="group" aria-label="Cách làm">
                  {(['WORD_BANK', 'TYPING'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => changeMode(m)}
                      disabled={!!result}
                      aria-pressed={mode === m}
                      className={`rounded-full px-3 py-1 transition-colors ${mode === m ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                    >
                      {m === 'WORD_BANK' ? 'Xếp từ' : 'Gõ câu'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-hairline" role="progressbar" aria-label="Tiến độ lượt luyện" aria-valuemin={0} aria-valuemax={queue.length} aria-valuenow={pos}>
                <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(pos / queue.length) * 100}%` }} />
              </div>
            </div>

            {error && (
              <div className="mb-3">
                <Alert tone="danger">{error}</Alert>
              </div>
            )}

            <div key={item.id} className="rounded-xl border border-hairline bg-card px-5 pb-6 pt-5 sm:px-8">
              <p className="text-xs font-medium text-muted">Dịch sang tiếng Đức</p>
              <p className="mt-2 font-display text-2xl font-semibold leading-snug text-ink">{item.viText}</p>

              {!result && (
                <>
                  {hintLevel > 0 && (
                    <div className="mt-4 space-y-2 rounded-lg bg-surface px-4 py-3 text-sm">
                      {item.keywords.length > 0 && (
                        <p className="flex flex-wrap items-center gap-1.5">
                          <span className="text-muted">Từ khoá:</span>
                          {item.keywords.map((k) => (
                            <span key={k} className="rounded-full border border-hairline bg-card px-2 py-0.5 font-medium text-ink">
                              {k}
                            </span>
                          ))}
                        </p>
                      )}
                      {hintLevel > 1 && (
                        <p className="font-mono tracking-wide text-ink">
                          <span className="font-sans text-muted">Chữ đầu: </span>
                          {firstLetterHint(item.deReference)}
                        </p>
                      )}
                    </div>
                  )}

                  {mode === 'WORD_BANK' ? (
                    <WordBank tokens={tokens} picked={picked} onPick={(i) => setPicked((p) => [...p, i])} onUnpick={(k) => setPicked((p) => p.filter((_, x) => x !== k))} />
                  ) : (
                    <form
                      className="mt-5"
                      onSubmit={(e) => {
                        e.preventDefault()
                        submit()
                      }}
                    >
                      <input
                        ref={inputRef}
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        aria-label="Bản dịch tiếng Đức"
                        placeholder="Gõ câu tiếng Đức rồi nhấn Enter"
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className="h-12 w-full rounded-md border border-hairline bg-canvas px-4 text-base text-ink placeholder:text-muted transition-[border-color,box-shadow] duration-150 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
                      />
                      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Chèn chữ có dấu">
                        {UMLAUT_KEYS.map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => insertChar(k)}
                            className="h-8 min-w-8 rounded-sm border border-hairline bg-canvas px-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
                          >
                            {k}
                          </button>
                        ))}
                      </div>
                    </form>
                  )}

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setHintLevel((h) => Math.min(2, h + 1))}
                      disabled={hintLevel >= 2}
                      className="rounded-md border border-hairline bg-canvas px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-40"
                    >
                      Gợi ý{hintLevel > 0 ? ` (${hintLevel}/2)` : ''}
                    </button>
                    <button
                      onClick={() => submit(true)}
                      disabled={checking}
                      className="rounded-md border border-hairline bg-canvas px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-40"
                    >
                      <span className="sm:hidden">Đáp án</span>
                      <span className="hidden sm:inline">Xem đáp án</span>
                    </button>
                    <button
                      onClick={() => submit()}
                      disabled={checking || !answer.trim()}
                      className="rounded-md bg-primary px-3 py-3 text-sm font-semibold text-canvas transition-[background,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary-deep hover:shadow-lifted disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
                    >
                      {checking ? 'Đang chấm...' : 'Kiểm tra'}
                    </button>
                  </div>
                </>
              )}

              {result && <Feedback result={result} answer={submitted} />}
            </div>

            {result && (
              <button
                ref={nextRef}
                onClick={next}
                className="mt-4 w-full rounded-md bg-primary px-4 py-3 font-semibold text-canvas transition-[background,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary-deep hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                {pos + 1 < queue.length ? 'Câu tiếp' : 'Xem kết quả'}
              </button>
            )}
          </>
        )
      )}
    </div>
  )
}

// ------------------------------------------------------------------------------------------

function WordBank({
  tokens,
  picked,
  onPick,
  onUnpick,
}: {
  tokens: string[]
  picked: number[]
  onPick: (tokenIndex: number) => void
  onUnpick: (pickedIndex: number) => void
}) {
  return (
    <div className="mt-5">
      <div className="flex min-h-14 flex-wrap items-center gap-1.5 rounded-lg border border-dashed border-hairline bg-canvas px-3 py-2" aria-label="Câu đang xếp">
        {picked.length === 0 && <span className="text-sm text-muted">Bấm các từ bên dưới theo đúng thứ tự</span>}
        {picked.map((t, k) => (
          <button
            key={`${t}-${k}`}
            onClick={() => onUnpick(k)}
            className="rounded-md border border-ink/20 bg-card px-2.5 py-1.5 text-base font-medium text-ink transition-colors hover:border-danger/50 hover:text-danger"
            aria-label={`Bỏ từ ${tokens[t]}`}
          >
            {tokens[t]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Các từ để chọn">
        {tokens.map((w, i) => {
          const used = picked.includes(i)
          return (
            <button
              key={`${w}-${i}`}
              onClick={() => !used && onPick(i)}
              disabled={used}
              className="rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-base font-medium text-ink transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-lifted disabled:invisible"
            >
              {w}
            </button>
          )
        })}
      </div>
      <p className="mt-2 hidden text-xs text-muted sm:block">Bấm vào từ đã xếp để bỏ ra. Phím Backspace bỏ từ cuối, Enter để kiểm tra.</p>
    </div>
  )
}

const VERDICT_STYLE: Record<TranslationVerdict, { title: string; box: string; text: string }> = {
  CORRECT: { title: 'Chính xác!', box: 'bg-success-bg', text: 'text-success' },
  ALMOST: { title: 'Gần đúng', box: 'bg-success-bg', text: 'text-success' },
  WRONG: { title: 'Chưa đúng', box: 'bg-danger-bg', text: 'text-danger' },
  REVEALED: { title: 'Đáp án', box: 'bg-surface', text: 'text-ink' },
  UNGRADED: { title: 'Chưa chấm được', box: 'bg-surface', text: 'text-ink' },
}

function Feedback({ result, answer }: { result: TranslationCheckResult; answer: string }) {
  const style = VERDICT_STYLE[result.verdict]
  const showCorrection =
    result.corrected && answer && result.verdict !== 'CORRECT' && normalize(result.corrected) !== normalize(answer)
  return (
    <div className="mt-5 space-y-4" role="status">
      <div className={`rounded-lg px-4 py-3 ${style.box}`}>
        <p className={`flex items-center gap-2 font-semibold ${style.text}`}>
          {result.verdict === 'CORRECT' && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-ink" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
          )}
          {style.title}
        </p>
        {answer && result.verdict !== 'CORRECT' && (
          <p className="mt-2 text-sm">
            <span className="text-muted">Bạn viết: </span>
            <span className="text-ink">{answer}</span>
          </p>
        )}
        {showCorrection && (
          <p className="mt-1 text-sm">
            <span className="text-muted">Sửa lại: </span>
            {diffWords(answer, result.corrected!).map((w, i) => (
              <span key={i}>
                {i > 0 && ' '}
                <span className={w.changed ? 'font-semibold text-success underline decoration-2 underline-offset-2' : 'text-ink'}>{w.text}</span>
              </span>
            ))}
          </p>
        )}
        {result.errors.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {result.errors.map((e, i) => (
              <li key={i} className="text-ink">
                {e.wrong && e.right && (
                  <>
                    <span className="text-danger line-through">{e.wrong}</span> → <span className="font-semibold">{e.right}</span>
                    {': '}
                  </>
                )}
                <span className="text-muted">{e.explain}</span>
              </li>
            ))}
          </ul>
        )}
        {result.note && <p className="mt-2 text-sm text-ink">{result.note}</p>}
      </div>

      <div>
        <p className="text-xs font-medium text-muted">Câu mẫu</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <p className="font-display text-lg font-semibold leading-snug text-ink">{result.reference}</p>
          <button
            type="button"
            onClick={() => speak(result.reference)}
            aria-label="Nghe câu mẫu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas text-ink transition-colors hover:bg-surface"
          >
            <SpeakerIcon className="h-5 w-5" />
          </button>
        </div>
        {result.alternatives.length > 0 && (
          <div className="mt-2 text-sm">
            <p className="text-muted">Cũng đúng:</p>
            <ul className="mt-0.5 space-y-0.5 text-ink">
              {result.alternatives.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function Summary({
  queue,
  outcomes,
  listLink,
  onRetryWrong,
}: {
  queue: TranslationItem[]
  outcomes: Record<number, TranslationVerdict>
  listLink: string
  onRetryWrong: () => void
}) {
  const count = (pred: (v: TranslationVerdict | undefined) => boolean) => queue.filter((it) => pred(outcomes[it.id])).length
  const correct = count((v) => v === 'CORRECT')
  const almost = count((v) => v === 'ALMOST')
  const notYet = queue.length - correct - almost
  const rows = [
    { label: 'Đúng', value: correct, className: 'text-ink' },
    { label: 'Gần đúng', value: almost, className: 'text-ink' },
    { label: 'Chưa đúng', value: notYet, className: 'text-danger' },
  ]
  return (
    <div className="rounded-xl border border-hairline bg-card px-6 py-8 text-center">
      {/* Xong một lượt là khoảnh khắc đạt được: được dùng màu amber (DESIGN.md). */}
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-ink" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <p className="mt-4 font-display text-xl font-semibold text-ink">Xong lượt luyện</p>
      <p className="mt-1 text-sm text-muted">Bạn đã dịch {queue.length} câu.</p>
      <dl className="mx-auto mt-5 grid max-w-xs grid-cols-3 divide-x divide-hairline rounded-lg bg-surface py-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dd className={`font-display text-2xl font-semibold ${r.className}`}>{r.value}</dd>
            <dt className="text-xs text-muted">{r.label}</dt>
          </div>
        ))}
      </dl>
      <div className={`mt-6 grid gap-2 ${notYet > 0 ? 'sm:grid-cols-2' : ''}`}>
        <Link
          to={listLink}
          className="rounded-md border border-hairline bg-canvas px-4 py-3 font-semibold text-ink transition-colors hover:bg-surface"
        >
          Chọn chủ điểm khác
        </Link>
        {notYet > 0 && (
          <button
            onClick={onRetryWrong}
            className="rounded-md bg-primary px-4 py-3 font-semibold text-canvas transition-[background,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-primary-deep hover:shadow-lifted"
          >
            Luyện lại {notYet} câu chưa đúng
          </button>
        )}
      </div>
    </div>
  )
}
