import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BlankInput, Breadcrumb, Button, ButtonLink, IconButton, Input, Note, ProgressBar, Segmented, cn } from '@kit'
import {
  checkTranslation,
  getTranslationSet,
  type TranslationCheckResult,
  type TranslationItem,
  type TranslationSetDetail,
  type TranslationType,
  type TranslationVerdict,
} from '../api/translationApi'
import { Volume2 as SpeakerIcon } from 'lucide-react'
import { speak } from '../lib/speech'
import { diffWords, firstLetterHint, wordBankTokens } from '../lib/wordDiff'

type InputMode = 'WORD_BANK' | 'TYPING' | 'CLOZE'

// Collocation có thêm chế độ "Điền từ", nên nhớ lựa chọn riêng để không đè lựa chọn của các dạng khác.
const MODE_STORAGE_KEY = 'deutschpfad.translateMode'
const COLLOCATION_MODE_KEY = 'deutschpfad.translateMode.collocation'
const UMLAUT_KEYS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']

const passed = (v: TranslationVerdict | null | undefined) => v === 'CORRECT' || v === 'ALMOST'
const isPassage = (t: TranslationType) => t === 'PARAGRAPH' || t === 'ESSAY'

const MODE_LABELS: Record<InputMode, string> = { CLOZE: 'Điền từ', WORD_BANK: 'Xếp từ', TYPING: 'Gõ câu' }
const modesFor = (t: TranslationType): InputMode[] => (t === 'COLLOCATION' ? ['CLOZE', 'WORD_BANK', 'TYPING'] : ['WORD_BANK', 'TYPING'])
const storageKeyFor = (t: TranslationType) => (t === 'COLLOCATION' ? COLLOCATION_MODE_KEY : MODE_STORAGE_KEY)

const NOTE_TITLE: Record<TranslationType, string> = {
  GRAMMAR: 'Công thức',
  COLLOCATION: 'Về nhóm cụm từ này',
  PARAGRAPH: 'Từ nối trong đoạn',
  ESSAY: 'Redemittel của bài',
}

const PART_LABEL: Record<string, string> = { Einleitung: 'Mở bài', Hauptteil: 'Thân bài', Schluss: 'Kết bài' }

function readStoredMode(t: TranslationType): InputMode | null {
  try {
    const v = localStorage.getItem(storageKeyFor(t)) as InputMode | null
    return v && modesFor(t).includes(v) ? v : null
  } catch {
    return null
  }
}

/**
 * Lượt luyện: các câu chưa từng làm đúng trước; làm đúng hết rồi thì ôn lại cả bài. Đoạn văn và essay luôn đi đủ
 * từ đầu đến cuối, vì mỗi câu cần ngữ cảnh của các câu trước.
 */
function buildQueue(set: TranslationSetDetail): number[] {
  if (isPassage(set.type)) return set.items.map((_, i) => i)
  const open = set.items.map((it, i) => (passed(it.lastVerdict) ? -1 : i)).filter((i) => i >= 0)
  return open.length > 0 ? open : set.items.map((_, i) => i)
}

/** Tách câu tại từ bị khoét (khớp nguyên từ), null nếu không tìm thấy. */
function splitAtGap(sentence: string, gap: string | null): [string, string] | null {
  if (!gap) return null
  const escaped = gap.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = new RegExp(`(^|[^\\p{L}])(${escaped})(?=[^\\p{L}]|$)`, 'u').exec(sentence)
  if (!m) return null
  const start = m.index + m[1].length
  return [sentence.slice(0, start), sentence.slice(start + gap.length)]
}

/** Câu tiếng Đức ghép vào "bản của bạn": câu đúng giữ nguyên lời người học, còn lại lấy bản đã sửa hoặc câu mẫu. */
function writtenSentence(result: TranslationCheckResult, answer: string, mode: InputMode): string {
  if (mode === 'CLOZE') return result.reference
  const text = result.verdict === 'CORRECT' ? answer.trim() : result.verdict === 'ALMOST' ? result.corrected ?? result.reference : result.reference
  const end = /[.!?]$/.exec(result.reference)?.[0]
  return end && !/[.!?]$/.test(text) ? text + end : text
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
  const [written, setWritten] = useState<Record<number, string>>({})
  const [showNote, setShowNote] = useState(true)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    getTranslationSet(Number(setId))
      .then((s) => {
        setSet(s)
        setQueue(buildQueue(s))
        setMode(readStoredMode(s.type) ?? (s.type === 'COLLOCATION' ? 'CLOZE' : s.level === 'A1' || s.level === 'A2' ? 'WORD_BANK' : 'TYPING'))
      })
      .catch(() => setLoadError(true))
  }, [setId])

  const finished = set !== null && queue.length > 0 && pos >= queue.length
  const item: TranslationItem | null = set && !finished && queue.length > 0 ? set.items[queue[pos]] : null
  const tokens = useMemo(() => (item ? wordBankTokens(item.deReference, item.id) : []), [item])
  const clozeParts = item ? splitAtGap(item.deReference, item.gap) : null
  // Câu không có chỗ trống (hiếm) thì chế độ "Điền từ" lùi về gõ cả câu.
  const itemMode: InputMode = mode === 'CLOZE' && !clozeParts ? 'TYPING' : mode
  const answer = itemMode === 'WORD_BANK' ? picked.map((i) => tokens[i]).join(' ') : typed

  useEffect(() => {
    if (result) nextRef.current?.focus()
    else if (itemMode !== 'WORD_BANK') inputRef.current?.focus()
  }, [result, itemMode, pos])

  // Xếp từ: Backspace bỏ từ vừa chọn, Enter để kiểm tra (không cần chuột).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (itemMode !== 'WORD_BANK' || result || checking) return
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
      if (set) localStorage.setItem(storageKeyFor(set.type), next)
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
      const r = await checkTranslation(item.id, reveal ? null : answer, reveal ? 'REVEAL' : itemMode)
      setSubmitted(reveal ? '' : answer)
      setResult(r)
      setOutcomes((o) => ({ ...o, [item.id]: r.verdict }))
      setWritten((w) => ({ ...w, [item.id]: writtenSentence(r, reveal ? '' : answer, itemMode) }))
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
    const wrong = isPassage(set.type) ? [] : queue.filter((i) => !passed(outcomes[set.items[i].id]))
    setQueue(wrong.length > 0 ? wrong : set.items.map((_, i) => i))
    setOutcomes({})
    setWritten({})
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
        <Note tone="bad" className="mb-4">Không tải được bài luyện dịch.</Note>
      </div>
    )
  }
  if (!set) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-10 animate-pulse rounded-karte bg-karteikarte-innen" />
        <div className="h-72 animate-pulse rounded-karte bg-karteikarte-innen" />
      </div>
    )
  }

  const listLink = set.type === 'GRAMMAR'
    ? `/app/writing/translate?level=${set.level}`
    : `/app/writing/translate?type=${set.type}&level=${set.level}`

  return (
    // pb-24 trên điện thoại: nút gia sư nổi ở góc dưới không che mất nút "Kiểm tra".
    <div className="mx-auto max-w-2xl pb-24 sm:pb-0">
      <Breadcrumb
        items={[
          { label: 'Viết', to: '/app/writing' },
          { label: 'Luyện dịch', to: listLink },
          { label: set.title },
        ]}
      />

      <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-bleistift">{set.title}</h2>
          {set.subtitle && <p className="text-sm text-radiert">{set.subtitle} · {set.level}</p>}
        </div>
        {set.grammarSlug && (
          <Link to={`/app/grammar/${set.grammarSlug}`} className="text-sm font-semibold text-bleistift hover:underline">
            Xem lại lý thuyết
          </Link>
        )}
      </header>

      {set.structureNote && (
        <div className="mb-5 rounded-karte bg-karteikarte-innen px-4 py-3 text-sm">
          <Button variant="ghost" className="w-full justify-between text-left"
            onClick={() => setShowNote((v) => !v)}
            aria-expanded={showNote}>
            {NOTE_TITLE[set.type]}
            <span className="text-xs font-medium text-radiert">{showNote ? 'Ẩn' : 'Hiện'}</span>
          </Button>
          {showNote && <p className="mt-1 leading-relaxed text-bleistift">{set.structureNote}</p>}
        </div>
      )}

      {finished ? (
        <Summary
          set={set}
          queue={queue.map((i) => set.items[i])}
          outcomes={outcomes}
          written={written}
          listLink={listLink}
          onRetryWrong={retryWrong}
        />
      ) : (
        item && (
          <>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-bleistift">
                  Câu {pos + 1} <span className="font-normal text-radiert">/ {queue.length}</span>
                </span>
                <Segmented label="Cách làm" value={mode} onChange={(v) => { if (!result) changeMode(v as InputMode) }}
                  options={modesFor(set.type).map((m) => ({ value: m, label: MODE_LABELS[m] }))} />
              </div>
              <ProgressBar value={pos / queue.length} label="Tiến độ lượt luyện" />
            </div>

            {error && (
              <div className="mb-3">
                <Note tone="bad" className="mb-4">{error}</Note>
              </div>
            )}

            {isPassage(set.type) && <PassageContext items={set.items} current={queue[pos]} written={written} essay={set.type === 'ESSAY'} />}

            <div key={item.id} className="rounded-karte border border-kartenrand bg-karteikarte px-5 pb-6 pt-5 sm:px-8">
              <p className="flex flex-wrap items-center gap-2 text-xs font-medium text-radiert">
                {itemMode === 'CLOZE' ? 'Điền từ còn thiếu' : 'Dịch sang tiếng Đức'}
                {item.partLabel && (
                  <span className="rounded-reiter bg-tinte-soft px-2 py-0.5 text-tinte">{PART_LABEL[item.partLabel] ?? item.partLabel}</span>
                )}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold leading-snug text-bleistift">{item.viText}</p>

              {!result && (
                <>
                  {hintLevel > 0 && (
                    <div className="mt-4 space-y-2 rounded-karte bg-karteikarte-innen px-4 py-3 text-sm">
                      {item.focus && (
                        <p>
                          <span className="text-radiert">{set.type === 'COLLOCATION' ? 'Cụm cần dùng: ' : 'Nên dùng: '}</span>
                          <span lang="de" className="font-medium text-bleistift">{item.focus}</span>
                        </p>
                      )}
                      {itemMode !== 'CLOZE' && item.keywords.length > 0 && (
                        <p className="flex flex-wrap items-center gap-1.5">
                          <span className="text-radiert">Từ khoá:</span>
                          {item.keywords.map((k) => (
                            <span key={k} className="rounded-rund border border-kartenrand bg-karteikarte px-2 py-0.5 font-medium text-bleistift">
                              {k}
                            </span>
                          ))}
                        </p>
                      )}
                      {hintLevel > 1 && (
                        <p className="font-mono tracking-wide text-bleistift">
                          <span className="font-sans text-radiert">Chữ đầu: </span>
                          {firstLetterHint(itemMode === 'CLOZE' && item.gap ? item.gap : item.deReference)}
                        </p>
                      )}
                    </div>
                  )}

                  {itemMode === 'WORD_BANK' ? (
                    <WordBank tokens={tokens} picked={picked} onPick={(i) => setPicked((p) => [...p, i])} onUnpick={(k) => setPicked((p) => p.filter((_, x) => x !== k))} />
                  ) : itemMode === 'CLOZE' && clozeParts && item.gap ? (
                    <form
                      className="mt-5"
                      onSubmit={(e) => {
                        e.preventDefault()
                        submit()
                      }}
                    >
                      <p lang="de" className="text-lg leading-loose text-bleistift">
                        {clozeParts[0]}
                        <BlankInput
                          ref={inputRef}
                          value={typed}
                          onChange={(e) => setTyped(e.target.value)}
                          chars={Math.max(item.gap.length, 6)}
                          aria-label="Từ còn thiếu"
                          autoCapitalize="off"
                          autoCorrect="off"
                        />
                        {clozeParts[1]}
                      </p>
                      <UmlautKeys onInsert={insertChar} />
                    </form>
                  ) : (
                    <form
                      className="mt-5"
                      onSubmit={(e) => {
                        e.preventDefault()
                        submit()
                      }}
                    >
                      <Input
                        ref={inputRef}
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        aria-label="Bản dịch tiếng Đức"
                        placeholder="Gõ câu tiếng Đức rồi nhấn Enter"
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className="h-12 w-full"
                      />
                      <UmlautKeys onInsert={insertChar} />
                    </form>
                  )}

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Button variant="secondary" className="disabled:opacity-40"
                      onClick={() => setHintLevel((h) => Math.min(2, h + 1))}
                      disabled={hintLevel >= 2}>
                      Gợi ý{hintLevel > 0 ? ` (${hintLevel}/2)` : ''}
                    </Button>
                    <Button variant="secondary" className="disabled:opacity-40"
                      onClick={() => submit(true)}
                      disabled={checking}>
                      <span className="sm:hidden">Đáp án</span>
                      <span className="hidden sm:inline">Xem đáp án</span>
                    </Button>
                    <Button variant="primary" className="hover:-translate-y-px disabled:translate-y-0 disabled:opacity-40"
                      onClick={() => submit()}
                      disabled={checking || !answer.trim()}>
                      {checking ? 'Đang chấm...' : 'Kiểm tra'}
                    </Button>
                  </div>
                </>
              )}

              {result && <Feedback result={result} answer={submitted} focus={set.type === 'COLLOCATION' ? item.focus : null} cloze={itemMode === 'CLOZE'} />}
            </div>

            {result && (
              <Button variant="primary" className="mt-4 w-full hover:-translate-y-px"
                ref={nextRef}
                onClick={next}>
                {pos + 1 < queue.length ? 'Câu tiếp' : 'Xem kết quả'}
              </Button>
            )}
          </>
        )
      )}
    </div>
  )
}

// ------------------------------------------------------------------------------------------

function UmlautKeys({ onInsert }: { onInsert: (char: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Chèn chữ có dấu">
      {UMLAUT_KEYS.map((k) => (
        <Button variant="secondary" size="sm" className="h-8 min-w-8" key={k} type="button" onClick={() => onInsert(k)}>
          {k}
        </Button>
      ))}
    </div>
  )
}

/** Gom các câu liền nhau cùng phần bài (Einleitung, Hauptteil, Schluss); đoạn văn thì chỉ có một nhóm. */
function groupByPart(items: TranslationItem[]) {
  const groups: { part: string | null; items: { item: TranslationItem; index: number }[] }[] = []
  items.forEach((item, index) => {
    const last = groups[groups.length - 1]
    if (last && last.part === item.partLabel) last.items.push({ item, index })
    else groups.push({ part: item.partLabel, items: [{ item, index }] })
  })
  return groups
}

/** Cả đoạn tiếng Việt (câu đang dịch được tô), và phần tiếng Đức người học đã dịch tới đâu. */
function PassageContext({ items, current, written, essay }: {
  items: TranslationItem[]
  current: number
  written: Record<number, string>
  essay: boolean
}) {
  const done = items.filter((it) => written[it.id])
  return (
    <div className="mb-4 rounded-karte bg-karteikarte-innen px-4 py-3 text-sm leading-relaxed">
      <p className="mb-1 text-xs font-medium text-radiert">{essay ? 'Bài cần dịch' : 'Đoạn cần dịch'}</p>
      <div className="space-y-2">
        {groupByPart(items).map((g, gi) => (
          <p key={gi}>
            {g.part && <span className="mr-1 font-semibold text-bleistift">{PART_LABEL[g.part] ?? g.part}:</span>}
            {g.items.map(({ item, index }) => (
              <span key={item.id}
                className={cn(index === current ? 'rounded-karte bg-tinte-soft px-1 font-medium text-bleistift' : written[item.id] ? 'text-radiert' : 'text-bleistift')}
                aria-current={index === current ? 'step' : undefined}>
                {item.viText}{' '}
              </span>
            ))}
          </p>
        ))}
      </div>
      {done.length > 0 && (
        <div className="mt-3 border-t border-linie pt-3">
          <p className="mb-1 text-xs font-medium text-radiert">Bản tiếng Đức của bạn tới giờ</p>
          <p lang="de" className="text-bleistift">{done.map((it) => written[it.id]).join(' ')}</p>
        </div>
      )}
    </div>
  )
}

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
      <div className="flex min-h-14 flex-wrap items-center gap-1.5 rounded-karte border border-dashed border-linie bg-karteikarte px-3 py-2" aria-label="Câu đang xếp">
        {picked.length === 0 && <span className="text-sm text-radiert">Bấm các từ bên dưới theo đúng thứ tự</span>}
        {picked.map((t, k) => (
          <Button variant="secondary" size="sm" className="hover:text-rotstift"
            key={`${t}-${k}`}
            onClick={() => onUnpick(k)}
           
            aria-label={`Bỏ từ ${tokens[t]}`}>
            {tokens[t]}
          </Button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Các từ để chọn">
        {tokens.map((w, i) => {
          const used = picked.includes(i)
          return (
            <Button variant="secondary" size="sm" className="hover:-translate-y-px"
              key={`${w}-${i}`}
              onClick={() => !used && onPick(i)}
              disabled={used}>
              {w}
            </Button>
          )
        })}
      </div>
      <p className="mt-2 hidden text-xs text-radiert sm:block">Bấm vào từ đã xếp để bỏ ra. Phím Backspace bỏ từ cuối, Enter để kiểm tra.</p>
    </div>
  )
}

const VERDICT_STYLE: Record<TranslationVerdict, { title: string; box: string; text: string }> = {
  CORRECT: { title: 'Chính xác!', box: 'bg-aufstieg-soft', text: 'text-aufstieg' },
  ALMOST: { title: 'Gần đúng', box: 'bg-aufstieg-soft', text: 'text-aufstieg' },
  WRONG: { title: 'Chưa đúng', box: 'bg-rotstift-soft', text: 'text-rotstift' },
  REVEALED: { title: 'Đáp án', box: 'bg-karteikarte-innen', text: 'text-bleistift' },
  UNGRADED: { title: 'Chưa chấm được', box: 'bg-karteikarte-innen', text: 'text-bleistift' },
}

function Feedback({ result, answer, focus, cloze }: {
  result: TranslationCheckResult
  answer: string
  focus: string | null
  /** Điền từ: lỗi đã nói rõ từ đúng, không cần thêm dòng "Sửa lại" chỉ có một chữ. */
  cloze: boolean
}) {
  const style = VERDICT_STYLE[result.verdict]
  const showCorrection =
    !cloze && result.corrected && answer && result.verdict !== 'CORRECT' && normalize(result.corrected) !== normalize(answer)
  return (
    <div className="mt-5 space-y-4" role="status">
      <div className={`rounded-karte px-4 py-3 ${style.box}`}>
        <p className={`flex items-center gap-2 font-semibold ${style.text}`}>
          {result.verdict === 'CORRECT' && (
            <span className="flex size-6 items-center justify-center rounded-rund bg-reiter text-reiter-beschriftung" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
          )}
          {style.title}
        </p>
        {answer && result.verdict !== 'CORRECT' && (
          <p className="mt-2 text-sm">
            <span className="text-radiert">Bạn viết: </span>
            <span className="text-bleistift">{answer}</span>
          </p>
        )}
        {showCorrection && (
          <p className="mt-1 text-sm">
            <span className="text-radiert">Sửa lại: </span>
            {diffWords(answer, result.corrected!).map((w, i) => (
              <span key={i}>
                {i > 0 && ' '}
                <span className={w.changed ? 'font-semibold text-aufstieg underline decoration-2 underline-offset-2' : 'text-bleistift'}>{w.text}</span>
              </span>
            ))}
          </p>
        )}
        {result.errors.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {result.errors.map((e, i) => (
              <li key={i} className="text-bleistift">
                {e.wrong && e.right && (
                  <>
                    <span className="text-rotstift line-through">{e.wrong}</span> → <span className="font-semibold">{e.right}</span>
                    {': '}
                  </>
                )}
                <span className="text-radiert">{e.explain}</span>
              </li>
            ))}
          </ul>
        )}
        {result.note && <p className="mt-2 text-sm text-bleistift">{result.note}</p>}
      </div>

      <div>
        <p className="text-xs font-medium text-radiert">Câu mẫu</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <p className="font-display text-lg font-semibold leading-snug text-bleistift">{result.reference}</p>
          <IconButton variant="secondary" label="Nghe câu mẫu" icon={<SpeakerIcon className="size-5" />}
            onClick={() => speak(result.reference)} />
        </div>
        {focus && (
          <p className="mt-1 text-sm">
            <span className="text-radiert">Cụm cố định: </span>
            <span lang="de" className="font-medium text-bleistift">{focus}</span>
          </p>
        )}
        {result.alternatives.length > 0 && (
          <div className="mt-2 text-sm">
            <p className="text-radiert">Cũng đúng:</p>
            <ul className="mt-0.5 space-y-0.5 text-bleistift">
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
  set,
  queue,
  outcomes,
  written,
  listLink,
  onRetryWrong,
}: {
  set: TranslationSetDetail
  queue: TranslationItem[]
  outcomes: Record<number, TranslationVerdict>
  written: Record<number, string>
  listLink: string
  onRetryWrong: () => void
}) {
  const passage = isPassage(set.type)
  const count = (pred: (v: TranslationVerdict | undefined) => boolean) => queue.filter((it) => pred(outcomes[it.id])).length
  const correct = count((v) => v === 'CORRECT')
  const almost = count((v) => v === 'ALMOST')
  const notYet = queue.length - correct - almost
  const rows = [
    { label: 'Đúng', value: correct, className: 'text-bleistift' },
    { label: 'Gần đúng', value: almost, className: 'text-bleistift' },
    { label: 'Chưa đúng', value: notYet, className: 'text-rotstift' },
  ]
  return (
    <div className="rounded-karte border border-kartenrand bg-karteikarte px-6 py-8 text-center">
      {/* Xong một lượt là khoảnh khắc đạt được: được dùng màu amber (DESIGN.md). */}
      <span className="mx-auto flex size-12 items-center justify-center rounded-rund bg-reiter text-reiter-beschriftung animate-stempel" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <p className="mt-4 font-display text-xl font-semibold text-bleistift">Xong lượt luyện</p>
      <p className="mt-1 text-sm text-radiert">Bạn đã dịch {queue.length} câu.</p>
      <dl className="mx-auto mt-5 grid max-w-xs grid-cols-3 divide-x divide-linie rounded-karte bg-karteikarte-innen py-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dd className={`font-display text-2xl font-semibold ${r.className}`}>{r.value}</dd>
            <dt className="text-xs text-radiert">{r.label}</dt>
          </div>
        ))}
      </dl>
      {passage && <PassageCompare items={set.items} written={written} />}
      <div className={`mt-6 grid gap-2 ${notYet > 0 || passage ? 'sm:grid-cols-2' : ''}`}>
        <ButtonLink to={listLink} variant="secondary">{set.type === 'GRAMMAR' ? 'Chọn chủ điểm khác' : 'Chọn bài khác'}</ButtonLink>
        {passage ? (
          <Button variant="primary" className="hover:-translate-y-px" onClick={onRetryWrong}>
            {set.type === 'ESSAY' ? 'Dịch lại cả bài' : 'Dịch lại cả đoạn'}
          </Button>
        ) : notYet > 0 && (
          <Button variant="primary" className="hover:-translate-y-px"
            onClick={onRetryWrong}>
            Luyện lại {notYet} câu chưa đúng
          </Button>
        )}
      </div>
    </div>
  )
}

/** Đặt "bản của bạn" cạnh "bản mẫu" theo từng phần, để nhìn cả đoạn liền mạch sau khi dịch từng câu. */
function PassageCompare({ items, written }: { items: TranslationItem[]; written: Record<number, string> }) {
  const groups = groupByPart(items)
  const column = (title: string, text: (it: TranslationItem) => string) => (
    <div className="rounded-karte bg-karteikarte-innen px-4 py-3">
      <p className="mb-2 text-xs font-medium text-radiert">{title}</p>
      <div className="space-y-2">
        {groups.map((g, i) => (
          <p key={i} lang="de" className="text-bleistift">
            {g.part && <span className="mr-1 font-semibold">{g.part}:</span>}
            {g.items.map(({ item }) => text(item)).join(' ')}
          </p>
        ))}
      </div>
    </div>
  )
  return (
    <div className="mt-6 grid gap-3 text-left text-sm leading-relaxed sm:grid-cols-2">
      {column('Bản của bạn', (it) => written[it.id] ?? '...')}
      {column('Bản mẫu', (it) => it.deReference)}
    </div>
  )
}
