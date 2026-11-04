import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { ArrowUp, Flame, RotateCcw } from 'lucide-react'
import { cn, focusRing } from './cn'

// Component riêng của DeutschPfad, dựng theo ẩn dụ Hộp thẻ Leitner.

export type Gender = 'der' | 'die' | 'das'

const genderTag: Record<Gender, string> = {
  der: 'bg-reiter-der-soft text-reiter-der',
  die: 'bg-reiter-die-soft text-reiter-die',
  das: 'bg-reiter-das-soft text-reiter-das',
}
const genderText: Record<Gender, string> = { der: 'text-reiter-der', die: 'text-reiter-die', das: 'text-reiter-das' }

/** Nhãn giống của danh từ: tab màu như học sinh Đức tô thẻ từ. */
export function GenderTag({ gender, className }: { gender: Gender; className?: string }) {
  return (
    <span className={cn('inline-flex min-w-9 items-center justify-center rounded-t-reiter px-2 py-0.5 text-xs font-bold', genderTag[gender], className)}>
      {gender}
    </span>
  )
}

/** Mạo từ tô màu theo giống, đặt ngay trước danh từ trong dòng chữ. */
export function Article({ gender, className }: { gender: Gender; className?: string }) {
  return <span className={cn('font-bold', genderText[gender], className)}>{gender}</span>
}

/** Chuỗi ngày học: tab hổ phách, thứ duy nhất được dùng hổ phách vì là thứ người học tự đạt được. */
export function StreakTab({ days, className }: { days: number; className?: string }) {
  return (
    <span className={cn('inline-flex min-h-8 items-center gap-1.5 rounded-t-reiter bg-reiter px-3 text-sm font-semibold text-reiter-beschriftung', className)}>
      <Flame className="size-4" aria-hidden="true" />
      <span>{days} ngày</span>
      <span className="sr-only">học liên tiếp</span>
    </span>
  )
}

/** Phản hồi sau khi trả lời: đúng thì thẻ lên ngăn, sai thì thẻ về ngăn 1. Không có còi báo động. */
export function AnswerFeedback({ correct, title, children, className }: {
  correct: boolean
  title?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div role="status"
      className={cn('flex gap-3 rounded-karte border px-4 py-3 text-sm text-bleistift',
        correct ? 'border-aufstieg/50 bg-aufstieg-soft animate-richtig' : 'border-rotstift/50 bg-rotstift-soft animate-falsch', className)}>
      <span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-rund',
        correct ? 'bg-aufstieg text-bleistift-invers' : 'bg-rotstift text-bleistift-invers')}>
        {correct ? <ArrowUp className="size-3.5" strokeWidth={3} aria-hidden="true" /> : <RotateCcw className="size-3.5" strokeWidth={3} aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-1 leading-relaxed">
        <p className={cn('font-semibold', correct ? 'text-aufstieg' : 'text-rotstift')}>{title ?? (correct ? 'Chính xác. Thẻ lên ngăn.' : 'Chưa đúng. Thẻ về ngăn 1.')}</p>
        {children && <div className="mt-0.5">{children}</div>}
      </div>
    </div>
  )
}

export interface LeitnerStage { label: ReactNode; hint?: ReactNode; count: number }

const fachColor = ['bg-fach-1', 'bg-fach-2', 'bg-fach-3', 'bg-fach-4']

/** Hộp thẻ 4 ngăn theo 4 mức nhớ thật của app. Chiều cao xấp thẻ theo số thẻ trong ngăn. */
export function LeitnerBox({ stages, className }: { stages: LeitnerStage[]; className?: string }) {
  const max = Math.max(1, ...stages.map((s) => s.count))
  return (
    <ul className={cn('grid grid-cols-4 gap-2', className)}>
      {stages.map((stage, index) => (
        <li key={index} className="flex min-w-0 flex-col">
          <div className="flex h-24 flex-col justify-end rounded-b-karte border border-t-0 border-linie bg-karteikarte-innen p-1.5" aria-hidden="true">
            <div className={cn('rounded-karte', fachColor[index % fachColor.length])}
              style={{ height: `${Math.max(4, Math.round((stage.count / max) * 100))}%` }} />
          </div>
          <p className="mt-1.5 font-display text-lg font-semibold text-bleistift">{stage.count}</p>
          <p className="text-sm font-medium text-bleistift">{stage.label}</p>
          {stage.hint && <p className="text-xs text-hauch">{stage.hint}</p>}
        </li>
      ))}
    </ul>
  )
}

/** Thẻ ôn từ lật hai mặt. Bấm vào thẻ (hoặc Enter/Space) để lật. Nút chấm mức nhớ đặt bên dưới, do trang tự lo. */
export function ReviewCard({ front, back, flipped, onFlip, label = 'Lật thẻ', className }: {
  front: ReactNode
  back: ReactNode
  flipped: boolean
  onFlip: () => void
  label?: string
  className?: string
}) {
  const face = 'flip-card-face flex min-h-64 w-full flex-col items-center justify-center rounded-karte border border-kartenrand bg-karteikarte lampenlicht p-6 text-center shadow-lift'
  return (
    <button type="button" onClick={onFlip} aria-label={label} aria-pressed={flipped}
      className={cn('flip-card block w-full rounded-karte text-bleistift', focusRing, className)}>
      <span className={cn('flip-card-inner block', flipped && 'is-flipped')}>
        <span className={face} aria-hidden={flipped}>{front}</span>
        <span className={cn(face, 'flip-card-face-back textur-linien')} aria-hidden={!flipped}>{back}</span>
      </span>
    </button>
  )
}

export type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dim'

const answerStates: Record<AnswerState, string> = {
  idle: 'border-kante bg-karteikarte text-bleistift hover:bg-karteikarte-innen',
  selected: 'border-bleistift bg-bleistift/10 text-bleistift',
  correct: 'border-aufstieg bg-aufstieg-soft text-aufstieg animate-richtig',
  wrong: 'border-rotstift bg-rotstift-soft text-rotstift animate-falsch',
  dim: 'border-linie bg-karteikarte text-hauch',
}

/** Một đáp án để chọn. Sau khi chọn: đúng (lên ngăn), sai (về ngăn 1), các đáp án còn lại mờ đi. */
export const AnswerOption = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { state?: AnswerState }>(
  function AnswerOption({ state = 'idle', className, type = 'button', ...props }, ref) {
    return (
      <button ref={ref} type={type} data-state={state}
        className={cn('min-h-12 rounded-karte border-2 px-4 py-3 font-semibold transition-colors duration-150 disabled:cursor-default', answerStates[state], focusRing, className)}
        {...props} />
    )
  },
)

export type QuestionMark = 'open' | 'correct' | 'wrong'

/** Dãy ô số để nhảy giữa các câu hỏi; mỗi ô mang trạng thái đã đúng/sai/chưa làm. */
export function QuestionNav({ marks, current, onSelect, label = 'Danh sách câu hỏi', className }: {
  marks: QuestionMark[]
  current: number
  onSelect: (index: number) => void
  label?: string
  className?: string
}) {
  return (
    <nav aria-label={label} className={cn('flex flex-wrap gap-1.5', className)}>
      {marks.map((mark, i) => (
        <button key={i} type="button" onClick={() => onSelect(i)} aria-current={i === current ? 'step' : undefined}
          aria-label={`Câu ${i + 1}${mark === 'correct' ? ', đúng' : mark === 'wrong' ? ', sai' : ''}`}
          className={cn('size-11 rounded-karte border text-sm font-semibold tabular-nums sm:size-9', focusRing,
            i === current ? 'border-bleistift bg-bleistift text-bleistift-invers'
              : mark === 'correct' ? 'border-aufstieg bg-aufstieg-soft text-aufstieg'
                : mark === 'wrong' ? 'border-rotstift bg-rotstift-soft text-rotstift'
                  : 'border-kante bg-karteikarte text-bleistift hover:bg-karteikarte-innen')}>
          {i + 1}
        </button>
      ))}
    </nav>
  )
}

/** Ô trống trong câu điền từ (cloze): nằm ngay trong dòng chữ, rộng theo độ dài từ cần điền. */
export const BlankInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { state?: 'empty' | 'correct' | 'wrong'; chars: number }>(
  function BlankInput({ state = 'empty', chars, className, style, ...props }, ref) {
    return (
      <input ref={ref} type="text" autoComplete="off" spellCheck={false} style={{ width: `${chars + 2}ch`, ...style }}
        aria-invalid={state === 'wrong' || undefined}
        className={cn('mx-1 inline-block rounded-karte border px-1 py-0.5 text-center text-base font-medium text-bleistift',
          'focus-visible:border-bleistift focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-fokus/30 disabled:opacity-80',
          state === 'empty' && 'border-kante bg-karteikarte-innen',
          state === 'correct' && 'border-aufstieg bg-aufstieg-soft text-aufstieg',
          state === 'wrong' && 'border-rotstift bg-rotstift-soft text-rotstift', className)}
        {...props} />
    )
  },
)
