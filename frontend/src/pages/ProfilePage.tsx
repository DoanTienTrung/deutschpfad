import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStudyTime } from '../context/StudyTimeContext'
import { getDashboard, setDailyGoal, type Dashboard, type DayCount } from '../api/dashboardApi'
import { getProgressSummary, getHeatmap } from '../api/progressApi'
import { getGrammarProgressSummary } from '../api/grammarApi'
import { listDecks } from '../api/deckApi'
import type { ProgressSummary, HeatmapDay, Deck, GrammarProgressSummary } from '../api/types'
import { hasVisitedAlphabet } from '../lib/onboarding'
import ContributionHeatmap from '../components/progress/ContributionHeatmap'
import ProgressBars from '../components/progress/ProgressBars'
import ColumnChart from '../components/dashboard/ColumnChart'
import GoalRing from '../components/dashboard/GoalRing'
import MasteryBar from '../components/dashboard/MasteryBar'

// Một phiên ôn tối đa 30 thẻ (backend: app.vocabulary.review-session-size); mỗi thẻ ~8 giây.
const REVIEW_SESSION_SIZE = 30
const SECONDS_PER_CARD = 8
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function parseDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function reviewMinutes(due: number) {
  return Math.max(1, Math.ceil((Math.min(due, REVIEW_SESSION_SIZE) * SECONDS_PER_CARD) / 60))
}

const card = 'rounded-lg border border-hairline bg-card p-5'
const cardHeading = 'text-xs font-semibold uppercase tracking-wider text-muted'

function Kpi({ label, value, sub, subTone = 'muted' }: { label: string; value: string; sub: string; subTone?: 'muted' | 'good' }) {
  return (
    <div className={card}>
      <p className={cardHeading}>{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
      <p className={`mt-1 text-sm ${subTone === 'good' ? 'text-success' : 'text-muted'}`}>{sub}</p>
    </div>
  )
}

function Hero({ dashboard, todaySeconds, onChangeGoal }: { dashboard: Dashboard; todaySeconds: number; onChangeGoal: (m: number) => void }) {
  const { user } = useAuth()
  const [todayLabel] = useState(() =>
    new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }),
  )
  const name = user?.fullName?.trim().split(/\s+/).pop() || 'bạn'
  const { vocabulary, streak, continueLearning } = dashboard
  const due = vocabulary.dueToday

  // Một hành động chính duy nhất, đổi theo việc người học nên làm nhất lúc này.
  let message: string
  let action: { label: string; to: string }
  if (due > 0) {
    message = `Có ${due} thẻ đang chờ bạn ôn hôm nay.`
    action = { label: `Ôn ${Math.min(due, REVIEW_SESSION_SIZE)} thẻ (~${reviewMinutes(due)} phút)`, to: '/app/review' }
  } else if (continueLearning.length > 0) {
    message = vocabulary.total > 0 ? 'Bạn đã ôn hết thẻ hôm nay. Học thêm một chút nhé.' : 'Học tiếp phần đang dở nhé.'
    action = { label: `Học tiếp: ${continueLearning[0].title}`, to: continueLearning[0].href }
  } else if (vocabulary.total === 0) {
    message = 'Bắt đầu từ bảng chữ cái và cách phát âm - mỗi ngày một chút là đủ.'
    action = { label: 'Bắt đầu với bảng chữ cái', to: '/app/vocabulary?mode=alphabet' }
  } else {
    message = 'Bạn đã ôn hết thẻ hôm nay. Học thêm vài từ mới nhé.'
    action = { label: 'Học từ mới', to: '/app/vocabulary' }
  }

  return (
    <section className="rounded-lg bg-primary p-6 text-canvas shadow-lifted sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-sm capitalize opacity-70">{todayLabel}</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-balance">Chào {name}!</h2>
          <p className="mt-2 opacity-85">{message}</p>
          <Link
            to={action.to}
            className="mt-5 inline-flex max-w-full items-center gap-2 rounded-md bg-canvas px-5 py-3 font-display font-semibold text-ink transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <span className="truncate">{action.label}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <p className="mt-4 text-sm">
            {streak.current > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-semibold text-ink">
                🔥 {streak.current} ngày liên tiếp
                <span className="font-normal opacity-75">· kỷ lục {streak.longest}</span>
              </span>
            ) : (
              <span className="opacity-70">Học hôm nay để bắt đầu chuỗi ngày 🔥</span>
            )}
          </p>
        </div>
        <GoalRing todaySeconds={todaySeconds} goalMinutes={dashboard.dailyGoalMinutes} onChangeGoal={onChangeGoal} />
      </div>
    </section>
  )
}

function Onboarding({ dashboard }: { dashboard: Dashboard }) {
  const [alphabet] = useState(hasVisitedAlphabet)
  const steps = [
    {
      done: alphabet,
      title: 'Làm quen bảng chữ cái & phát âm',
      hint: 'Nghe 30 chữ cái và những âm người Việt hay đọc sai.',
      to: '/app/vocabulary?mode=alphabet',
    },
    {
      done: dashboard.onboarding.learnedFirstWords,
      title: 'Học những từ đầu tiên',
      hint: 'Bắt đầu với bài "Đăng ký cư trú và giấy tờ" trong Sống ở Đức.',
      to: '/app/vocabulary?mode=life',
    },
    {
      done: dashboard.onboarding.reviewedOnLaterDay,
      title: 'Quay lại ôn vào ngày hôm sau',
      hint: 'Lần ôn đầu tiên là lúc từ bắt đầu được nhớ lâu.',
      to: '/app/review',
    },
  ]
  const doneCount = steps.filter((s) => s.done).length
  if (doneCount === steps.length) return null

  return (
    <section className={card}>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg font-semibold text-ink">Ba bước làm quen</p>
        <p className="text-sm text-muted">
          {doneCount}/{steps.length}
        </p>
      </div>
      <ol className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Link
              to={s.to}
              className={`flex items-start gap-3 rounded-md p-3 transition-colors ${s.done ? 'opacity-60' : 'hover:bg-surface'}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  s.done ? 'bg-success-bg text-success' : 'border border-hairline text-ink'
                }`}
              >
                {s.done ? '✓' : i + 1}
              </span>
              <span className="min-w-0">
                <span className={`block font-medium text-ink ${s.done ? 'line-through' : ''}`}>{s.title}</span>
                <span className="block text-sm text-muted">{s.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

function StudyChart({ days, goalMinutes }: { days: DayCount[]; goalMinutes: number }) {
  const columns = days.map((d, i) => {
    const minutes = Math.round(d.value / 60)
    const date = parseDay(d.date)
    const isToday = i === days.length - 1
    const dateText = isToday ? 'Hôm nay' : `${WEEKDAYS[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`
    return {
      key: d.date,
      label: isToday ? 'Nay' : i % 7 === 0 ? `${date.getDate()}/${date.getMonth() + 1}` : '',
      value: minutes,
      highlight: minutes >= goalMinutes,
      showValue: isToday,
      tooltip: `${dateText}: ${minutes} phút${minutes >= goalMinutes ? ' - đạt mục tiêu' : ''}`,
    }
  })
  return (
    <section className={card}>
      <p className={cardHeading}>Thời gian học 14 ngày qua</p>
      <div className="mt-8">
        <ColumnChart
          columns={columns}
          caption="Số phút học mỗi ngày trong 14 ngày qua"
          reference={{ value: goalMinutes }}
          formatValue={(v) => `${v}'`}
        />
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent" aria-hidden="true" /> Ngày đạt mục tiêu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-bar-muted" aria-hidden="true" /> Chưa đạt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t border-ink/40" aria-hidden="true" /> Mục tiêu {goalMinutes} phút
        </span>
      </p>
    </section>
  )
}

function ForecastChart({ days }: { days: DayCount[] }) {
  const total = days.reduce((s, d) => s + d.value, 0)
  const peak = Math.max(...days.map((d) => d.value))
  const columns = days.map((d, i) => {
    const date = parseDay(d.date)
    const label = i === 0 ? 'Nay' : i === 1 ? 'Mai' : WEEKDAYS[date.getDay()]
    const full = i === 0 ? 'Hôm nay (gồm thẻ quá hạn)' : i === 1 ? 'Ngày mai' : `${WEEKDAYS[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`
    return {
      key: d.date,
      label,
      value: d.value,
      showValue: i === 0 || (d.value === peak && peak > 0),
      tooltip: `${full}: ${d.value} thẻ`,
    }
  })
  return (
    <section className={card}>
      <div className="flex items-baseline justify-between gap-2">
        <p className={cardHeading}>Thẻ đến hạn 7 ngày tới</p>
        <p className="text-xs text-muted">Tổng {total} thẻ</p>
      </div>
      {total === 0 ? (
        <p className="mt-8 text-sm text-muted">Chưa có thẻ nào đến hạn trong 7 ngày tới.</p>
      ) : (
        <div className="mt-8">
          <ColumnChart columns={columns} caption="Số thẻ đến hạn ôn mỗi ngày trong 7 ngày tới" baseClass="bg-primary" />
        </div>
      )}
      <p className="mt-3 text-xs text-muted">Biết trước ngày nào nhiều thẻ để sắp xếp thời gian ôn.</p>
    </section>
  )
}

function ContinueLearning({ items }: { items: Dashboard['continueLearning'] }) {
  if (items.length === 0) return null
  return (
    <section>
      <p className="mb-3 font-display text-lg font-semibold text-ink">Học tiếp</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const lesson = item.type === 'LESSON'
          const percent = item.progressTotal === 0 ? 0 : Math.round((item.progress / item.progressTotal) * 100)
          return (
            <Link
              key={item.href}
              to={item.href}
              className="group flex items-center gap-4 rounded-lg border border-hairline bg-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-xl" aria-hidden="true">
                {lesson ? '📖' : '✏️'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted">
                  {lesson ? 'Từ vựng' : 'Ngữ pháp'} · {item.subtitle}
                </span>
                <span className="block truncate font-display font-semibold text-ink">{item.title}</span>
                <span className="mt-2 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {lesson ? `${item.progress}/${item.progressTotal} chế độ` : `đúng ${item.progress}/${item.progressTotal} câu`}
                  </span>
                </span>
              </span>
              <span className="text-lg text-muted transition-transform group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default function ProfilePage() {
  const { todaySeconds } = useStudyTime()
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [summary, setSummary] = useState<ProgressSummary[]>([])
  const [grammar, setGrammar] = useState<GrammarProgressSummary | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([])
  const [decks, setDecks] = useState<Deck[]>([])

  useEffect(() => {
    getDashboard().then(setDashboard).catch(() => {})
    getProgressSummary().then(setSummary).catch(() => {})
    getGrammarProgressSummary().then(setGrammar).catch(() => {})
    getHeatmap().then(setHeatmap).catch(() => {})
    listDecks().then(setDecks).catch(() => {})
  }, [])

  function changeGoal(minutes: number) {
    if (!dashboard) return
    const previous = dashboard.dailyGoalMinutes
    setDashboard({ ...dashboard, dailyGoalMinutes: minutes })
    setDailyGoal(minutes).catch(() => setDashboard((d) => (d ? { ...d, dailyGoalMinutes: previous } : d)))
  }

  if (!dashboard) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-56 animate-pulse rounded-lg bg-surface" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      </div>
    )
  }

  const { vocabulary, studyTime } = dashboard
  const thisWeekMin = Math.round(studyTime.thisWeekSeconds / 60)
  const lastWeekMin = Math.round(studyTime.lastWeekSeconds / 60)
  let weekSub = 'Chưa học tuần này'
  let weekTone: 'muted' | 'good' = 'muted'
  if (lastWeekMin > 0) {
    const change = Math.round(((thisWeekMin - lastWeekMin) / lastWeekMin) * 100)
    weekSub = change >= 0 ? `↑ ${change}% so với tuần trước` : `↓ ${Math.abs(change)}% so với tuần trước`
    weekTone = change >= 0 ? 'good' : 'muted'
  } else if (thisWeekMin > 0) {
    weekSub = 'Tuần trước chưa học'
  }
  const isNew = vocabulary.total === 0

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Hero dashboard={dashboard} todaySeconds={todaySeconds} onChangeGoal={changeGoal} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Từ đã thuộc"
          value={String(vocabulary.known + vocabulary.longTerm)}
          sub={vocabulary.newThisWeek > 0 ? `+${vocabulary.newThisWeek} từ mới tuần này` : 'Chưa có từ mới tuần này'}
          subTone={vocabulary.newThisWeek > 0 ? 'good' : 'muted'}
        />
        <Kpi
          label="Cần ôn hôm nay"
          value={String(vocabulary.dueToday)}
          sub={
            vocabulary.dueToday > 0
              ? `khoảng ${reviewMinutes(vocabulary.dueToday)} phút`
              : vocabulary.total > 0
                ? 'Đã ôn xong 🎉'
                : 'Học từ đầu tiên để có thẻ ôn'
          }
        />
        <Kpi label="Học tuần này" value={`${thisWeekMin} phút`} sub={weekSub} subTone={weekTone} />
        <Kpi
          label="Ngữ pháp thành thạo"
          value={`${dashboard.grammar.mastered}/${dashboard.grammar.totalTopics}`}
          sub="chủ điểm"
        />
      </div>

      <Onboarding dashboard={dashboard} />

      {!isNew && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <StudyChart days={studyTime.last14Days} goalMinutes={dashboard.dailyGoalMinutes} />
            <ForecastChart days={dashboard.reviewForecast} />
          </div>

          <section className={card}>
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <p className={cardHeading}>Mức độ thuộc từ</p>
              <p className="text-xs text-muted">{vocabulary.total} từ đã gặp</p>
            </div>
            <MasteryBar
              counts={{
                notYet: vocabulary.notYet,
                learning: vocabulary.learning,
                known: vocabulary.known,
                longTerm: vocabulary.longTerm,
              }}
            />
          </section>
        </>
      )}

      <ContinueLearning items={dashboard.continueLearning} />

      <section className={card}>
        <p className={`${cardHeading} mb-3`}>Hoạt động cả năm</p>
        <ContributionHeatmap data={heatmap} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={card}>
          <p className={`${cardHeading} mb-3`}>Tiến độ bài từ vựng</p>
          <ProgressBars summary={summary} />
        </section>

        {grammar && grammar.levels.length > 0 && (
          <section className={card}>
            <div className="mb-3 flex items-baseline justify-between">
              <p className={cardHeading}>Tiến độ ngữ pháp</p>
              <Link to="/app/grammar" className="text-sm font-medium text-primary hover:underline">
                Học tiếp →
              </Link>
            </div>
            <ul className="space-y-3">
              {grammar.levels.map((lv) => {
                const percent = lv.totalTopics === 0 ? 0 : Math.round((lv.mastered / lv.totalTopics) * 100)
                return (
                  <li key={lv.level}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-ink">{lv.level}</span>
                      <span className="text-muted">
                        Thành thạo {lv.mastered}/{lv.totalTopics}
                        {lv.learning > 0 && ` · đang học ${lv.learning}`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>

      {decks.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-display text-lg font-semibold text-ink">Bộ từ của tôi</p>
            <Link to="/app/decks" className="text-sm font-medium text-primary hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {decks.slice(0, 4).map((deck) => (
              <Link
                key={deck.id}
                to={`/app/decks/${deck.id}`}
                className="rounded-lg border border-hairline bg-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted"
              >
                <p className="font-display font-semibold text-ink">{deck.name}</p>
                <p className="mt-1 text-sm text-muted">{deck.itemCount} từ</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
