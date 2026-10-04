import { useState } from 'react'

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60]

/**
 * Vòng mục tiêu học trong ngày. Đầy vòng thì chuyển sang amber - đúng "khoảnh khắc đạt được" mà màu
 * amber dành riêng (DESIGN.md, The One Warm Color Rule). Bấm "Đổi mục tiêu" để chọn số phút khác.
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
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-canvas/15" />
          {ratio > 0 && (
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ratio)}
              className={`transition-[stroke-dashoffset] duration-700 ${done ? 'stroke-accent' : 'stroke-canvas'}`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" role="img" aria-label={`Hôm nay ${minutes} trên ${goalMinutes} phút`}>
          <span className="font-display text-3xl font-bold leading-none">{done ? '✓' : minutes}</span>
          <span className="mt-1 text-xs opacity-75">{done ? 'Đạt mục tiêu' : `/ ${goalMinutes} phút`}</span>
        </div>
      </div>
      {editing ? (
        <div className="mt-2 flex flex-wrap justify-center gap-1" role="group" aria-label="Chọn mục tiêu mỗi ngày">
          {GOAL_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => {
                onChangeGoal(m)
                setEditing(false)
              }}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                m === goalMinutes ? 'bg-canvas text-ink' : 'bg-canvas/15 hover:bg-canvas/25'
              }`}
            >
              {m}'
            </button>
          ))}
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="mt-2 text-xs underline-offset-2 opacity-75 hover:underline hover:opacity-100">
          Mục tiêu {goalMinutes} phút/ngày · Đổi
        </button>
      )}
    </div>
  )
}
