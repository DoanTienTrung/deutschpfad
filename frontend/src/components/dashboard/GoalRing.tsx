import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button, Chip } from '@kit'

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60]

/**
 * Vòng mục tiêu học trong ngày. Đầy vòng thì chuyển sang hổ phách - đúng "khoảnh khắc đạt được" mà màu
 * hổ phách dành riêng (DESIGN.md, The One Warm Color Rule). Bấm "Đổi" để chọn số phút khác.
 */
export default function GoalRing({
  todaySeconds,
  goalMinutes,
  onChangeGoal,
}: {
  todaySeconds: number
  goalMinutes: number
  onChangeGoal: (minutes: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const minutes = Math.floor(todaySeconds / 60)
  const ratio = Math.min(1, todaySeconds / (goalMinutes * 60))
  const done = ratio >= 1
  const r = 42
  const circumference = 2 * Math.PI * r

  return (
    <div className="flex flex-col items-center">
      <div className="relative size-32">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-linie" />
          {ratio > 0 && (
            <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ratio)}
              className={`transition-[stroke-dashoffset] duration-700 ${done ? 'stroke-reiter' : 'stroke-bleistift'}`} />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" role="img" aria-label={`Hôm nay ${minutes} trên ${goalMinutes} phút`}>
          <span className="font-display text-3xl leading-none font-bold text-bleistift">
            {done ? <Check className="size-8" strokeWidth={3} aria-hidden="true" /> : minutes}
          </span>
          <span className="mt-1 text-xs text-radiert">{done ? 'Đạt mục tiêu' : `/ ${goalMinutes} phút`}</span>
        </div>
      </div>
      {editing ? (
        <div className="mt-2 flex max-w-64 flex-wrap justify-center gap-1.5" role="group" aria-label="Chọn mục tiêu mỗi ngày">
          {GOAL_OPTIONS.map((m) => (
            <Chip key={m} selected={m === goalMinutes} onClick={() => { onChangeGoal(m); setEditing(false) }}>
              {m} phút
            </Chip>
          ))}
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="mt-1 font-medium text-radiert">
          Mục tiêu {goalMinutes} phút/ngày · Đổi
        </Button>
      )}
    </div>
  )
}
