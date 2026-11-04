import { useEffect, useState, type ReactNode } from 'react'
import { ArrowRight, BookOpen, Check, Ruler } from 'lucide-react'
import { ButtonLink, Card, CardButton, LeitnerBox, Skeleton, StreakTab, TextLink, cn } from '@kit'
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

// Một phiên ôn tối đa 30 thẻ (backend: app.vocabulary.review-session-size); mỗi thẻ ~8 giây.
const REVIEW_SESSION_SIZE = 30
const SECONDS_PER_CARD = 8
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Bốn mức nhớ thật của app = bốn ngăn hộp Leitner.
const MASTERY_STAGES = [
  { key: 'notYet', label: 'Chưa nhớ', hint: 'mới gặp hoặc vừa quên' },
  { key: 'learning', label: 'Đang học', hint: 'nhớ được 1 lần' },
  { key: 'known', label: 'Đã thuộc', hint: 'nhớ đúng từ 2 lần' },
  { key: 'longTerm', label: 'Nhớ lâu', hint: 'lịch ôn cách từ 3 tuần' },
] as const

function parseDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function reviewMinutes(due: number) {
  return Math.max(1, Math.ceil((Math.min(due, REVIEW_SESSION_SIZE) * SECONDS_PER_CARD) / 60))
}

const cardHeading = 'text-xs font-semibold uppercase tracking-wider text-radiert'

function Kpi({ label, value, sub, subTone = 'muted' }: { label: string; value: string; sub: ReactNode; subTone?: 'muted' | 'good' }) {
  return (
    <Card>
      <p className={cardHeading}>{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-bleistift">{value}</p>
      <p className={cn('mt-1 text-sm', subTone === 'good' ? 'text-aufstieg' : 'text-radiert')}>{sub}</p>
    </Card>
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
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-sm text-radiert capitalize">{todayLabel}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-balance">Chào {name}!</h1>
          <p className="mt-2 text-radiert">{message}</p>
          <ButtonLink to={action.to} className="mt-5 max-w-full">
            <span className="truncate">{action.label}</span>
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </ButtonLink>
          <div className="mt-4 text-sm">
            {streak.current > 0 ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <StreakTab days={streak.current} />
                <span className="text-radiert">Kỷ lục {streak.longest} ngày</span>
              </span>
            ) : (
              <span className="text-radiert">Học hôm nay để bắt đầu chuỗi ngày.</span>
            )}
          </div>
        </div>
        <GoalRing todaySeconds={todaySeconds} goalMinutes={dashboard.dailyGoalMinutes} onChangeGoal={onChangeGoal} />
      </div>
    </Card>
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
    <Card title="Ba bước làm quen" action={<span className="text-sm text-radiert">{doneCount}/{steps.length}</span>}>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <CardButton to={s.to} className={cn('flex items-start gap-3 p-3', s.done && 'opacity-60')}>
              <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-rund text-sm font-semibold',
                s.done ? 'bg-aufstieg-soft text-aufstieg' : 'border border-kante text-bleistift')}>
                {s.done ? <Check className="size-4" strokeWidth={3} aria-label="Đã xong" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={cn('block font-medium text-bleistift', s.done && 'line-through')}>{s.title}</span>
                <span className="block text-sm text-radiert">{s.hint}</span>
              </span>
            </CardButton>
          </li>
        ))}
      </ol>
    </Card>
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
    <Card>
      <p className={cardHeading}>Thời gian học 14 ngày qua</p>
      <div className="mt-8">
        <ColumnChart
          columns={columns}
          caption="Số phút học mỗi ngày trong 14 ngày qua"
          reference={{ value: goalMinutes }}
          formatValue={(v) => `${v}'`}
        />
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-radiert">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-karte bg-reiter" aria-hidden="true" /> Ngày đạt mục tiêu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-karte bg-kante/45" aria-hidden="true" /> Chưa đạt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t border-bleistift/40" aria-hidden="true" /> Mục tiêu {goalMinutes} phút
        </span>
      </p>
    </Card>
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
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <p className={cardHeading}>Thẻ đến hạn 7 ngày tới</p>
        <p className="text-xs text-radiert">Tổng {total} thẻ</p>
      </div>
      {total === 0 ? (
        <p className="mt-8 text-sm text-radiert">Chưa có thẻ nào đến hạn trong 7 ngày tới.</p>
      ) : (
        <div className="mt-8">
          <ColumnChart columns={columns} caption="Số thẻ đến hạn ôn mỗi ngày trong 7 ngày tới" baseClass="bg-bleistift" />
        </div>
      )}
      <p className="mt-3 text-xs text-radiert">Biết trước ngày nào nhiều thẻ để sắp xếp thời gian ôn.</p>
    </Card>
  )
}

function ContinueLearning({ items }: { items: Dashboard['continueLearning'] }) {
  if (items.length === 0) return null
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold text-bleistift">Học tiếp</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const lesson = item.type === 'LESSON'
          const percent = item.progressTotal === 0 ? 0 : Math.round((item.progress / item.progressTotal) * 100)
          return (
            <CardButton key={item.href} to={item.href} className="group flex items-center gap-4 p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-rund bg-karteikarte-innen text-radiert" aria-hidden="true">
                {lesson ? <BookOpen className="size-5" /> : <Ruler className="size-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-radiert">
                  {lesson ? 'Từ vựng' : 'Ngữ pháp'} · {item.subtitle}
                </span>
                <span className="block truncate font-display font-semibold text-bleistift">{item.title}</span>
                <span className="mt-2 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-rund bg-linie">
                    <span className="block h-full rounded-rund bg-bleistift" style={{ width: `${percent}%` }} />
                  </span>
                  <span className="shrink-0 text-xs text-radiert">
                    {lesson ? `${item.progress}/${item.progressTotal} chế độ` : `đúng ${item.progress}/${item.progressTotal} câu`}
                  </span>
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-radiert transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </CardButton>
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
      <div className="mx-auto max-w-seite space-y-4">
        <Skeleton className="h-56" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
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
    weekSub = change >= 0 ? `Tăng ${change}% so với tuần trước` : `Giảm ${Math.abs(change)}% so với tuần trước`
    weekTone = change >= 0 ? 'good' : 'muted'
  } else if (thisWeekMin > 0) {
    weekSub = 'Tuần trước chưa học'
  }
  const isNew = vocabulary.total === 0

  return (
    <div className="mx-auto max-w-seite space-y-4">
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
                ? 'Đã ôn xong hôm nay'
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

          <Card title="Hộp thẻ của bạn" action={<span className="text-xs text-radiert">{vocabulary.total} từ đã gặp</span>}>
            <LeitnerBox stages={MASTERY_STAGES.map((stage) => ({ label: stage.label, hint: stage.hint, count: vocabulary[stage.key] }))} />
          </Card>
        </>
      )}

      <ContinueLearning items={dashboard.continueLearning} />

      <Card>
        <p className={cn(cardHeading, 'mb-3')}>Hoạt động cả năm</p>
        <ContributionHeatmap data={heatmap} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className={cn(cardHeading, 'mb-3')}>Tiến độ bài từ vựng</p>
          <ProgressBars summary={summary} />
        </Card>

        {grammar && grammar.levels.length > 0 && (
          <Card>
            <div className="mb-3 flex items-baseline justify-between">
              <p className={cardHeading}>Tiến độ ngữ pháp</p>
              <TextLink to="/app/grammar" className="text-sm">Học tiếp</TextLink>
            </div>
            <ul className="space-y-3">
              {grammar.levels.map((lv) => {
                const percent = lv.totalTopics === 0 ? 0 : Math.round((lv.mastered / lv.totalTopics) * 100)
                return (
                  <li key={lv.level}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <span className="font-medium text-bleistift">{lv.level}</span>
                      <span className="text-radiert">
                        Thành thạo {lv.mastered}/{lv.totalTopics}
                        {lv.learning > 0 && ` · đang học ${lv.learning}`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-rund bg-linie">
                      <div className="h-full rounded-rund bg-reiter transition-[width] duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
      </div>

      {decks.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold text-bleistift">Bộ từ của tôi</h2>
            <TextLink to="/app/decks" className="text-sm">Xem tất cả</TextLink>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {decks.slice(0, 4).map((deck) => (
              <CardButton key={deck.id} to={`/app/decks/${deck.id}`} className="p-4">
                <p className="font-display font-semibold text-bleistift">{deck.name}</p>
                <p className="mt-1 text-sm text-radiert">{deck.itemCount} từ</p>
              </CardButton>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
