import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen, BookOpenText, ChevronLeft, ChevronRight, Flame, Headphones, House, Layers, Menu, Mic, Monitor, Moon, PencilLine,
  Repeat2, Ruler, Sun, Timer, User, X,
} from 'lucide-react'
import { Button, Drawer, IconButton, NavItem, Segmented, StreakTab, cn, focusRing } from '@kit'
import { getStreak } from '../api/streakApi'
import { getVocabularyStats } from '../api/vocabularyApi'
import type { Streak } from '../api/types'
import { StudyTimeProvider, useStudyTime } from '../context/StudyTimeContext'
import { formatStudyTimeClock } from '../lib/studyTime'
import { useAuth } from '../context/AuthContext'
import { applyTheme, getThemePreference, setThemePreference, watchSystemTheme, type ThemePreference } from '../lib/theme'
import TutorChatWidget from './TutorChatWidget'

function BreakReminderBanner() {
  const { breakReminderMessage, dismissBreakReminder } = useStudyTime()
  const { user } = useAuth()

  if (!breakReminderMessage) return null

  const name = user?.fullName?.trim() || 'Bạn'

  // Nhắc nghỉ là thông tin, không phải thành tích: dùng màu mực xanh, không dùng hổ phách.
  return (
    <div className="relative flex items-center overflow-hidden border-b border-tinte/40 bg-tinte-soft px-4 py-1 text-bleistift">
      <div className="relative h-5 min-w-0 flex-1 overflow-hidden">
        <p className="break-reminder-track text-sm font-medium">
          {name} {breakReminderMessage}
        </p>
      </div>
      <IconButton label="Đóng nhắc nhở" icon={<X className="size-4" aria-hidden="true" />} onClick={dismissBreakReminder} className="ml-2" />
    </div>
  )
}

function StreakBadge({ streak, compact }: { streak: Streak; compact?: boolean }) {
  const [bump, setBump] = useState(false)
  const prevRef = useRef<number | null>(null)

  useEffect(() => {
    const increased = prevRef.current !== null && streak.currentStreak > prevRef.current
    prevRef.current = streak.currentStreak
    if (increased) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 400)
      return () => clearTimeout(t)
    }
  }, [streak.currentStreak])

  // Tab hổ phách: chỗ duy nhất trong khung app được dùng hổ phách, vì là thứ người học tự đạt được.
  // Thanh icon thu gọn: chỉ còn ngọn lửa và con số.
  if (compact) {
    return (
      <span title={`Chuỗi ${streak.currentStreak} ngày học liên tiếp`}
        className={cn('inline-flex flex-col items-center text-xs font-semibold tabular-nums', streak.currentStreak > 0 ? 'text-reiter-tief' : 'text-hauch', bump && 'streak-bump')}>
        <Flame className="size-4" aria-hidden="true" />
        {streak.currentStreak}
      </span>
    )
  }
  // Chưa có chuỗi thì chưa có gì để khen: hiện nhãn trung tính.
  if (streak.currentStreak === 0) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-hauch" title="Học hôm nay để bắt đầu chuỗi ngày">
        <Flame className="size-4" aria-hidden="true" />0 ngày
      </span>
    )
  }
  return <StreakTab days={streak.currentStreak} className={cn('shrink-0', bump && 'streak-bump')} />
}

function StudyTimeBadge() {
  const { todaySeconds } = useStudyTime()
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium tabular-nums text-radiert" title="Thời gian học hôm nay">
      <Timer className="size-4" aria-hidden="true" />
      <span className="sr-only">Hôm nay đã học</span>
      {formatStudyTimeClock(todaySeconds)}
    </span>
  )
}

type NavEntry = { to: string; label: string; icon: ReactNode; end?: boolean; badge?: number }

function DueBadge({ count }: { count: number }) {
  return (
    <span className="rounded-rund bg-rotstift-soft px-2 py-0.5 text-xs font-semibold tabular-nums text-rotstift">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function SidebarLink({ item, collapsed, onNavigate }: { item: NavEntry; collapsed: boolean; onNavigate?: () => void }) {
  const hasBadge = Boolean(item.badge && item.badge > 0)
  return (
    <NavItem to={item.to} end={item.end} icon={item.icon} collapsed={collapsed} onClick={onNavigate}
      label={hasBadge && collapsed ? `${item.label} (${item.badge})` : item.label}
      badge={hasBadge ? <DueBadge count={item.badge ?? 0} /> : undefined} />
  )
}

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: 'light', label: 'Sáng', icon: <Sun className="size-4" aria-hidden="true" /> },
  { value: 'dark', label: 'Tối', icon: <Moon className="size-4" aria-hidden="true" /> },
  { value: 'system', label: 'Theo máy', icon: <Monitor className="size-4" aria-hidden="true" /> },
]

function ThemeSwitcher({ collapsed }: { collapsed: boolean }) {
  const [pref, setPref] = useState<ThemePreference>(() => getThemePreference())

  // "Theo máy": đổi theo ngay khi hệ điều hành chuyển sáng/tối (vd. tự động theo giờ).
  useEffect(() => {
    if (pref !== 'system') return
    return watchSystemTheme(() => applyTheme('system'))
  }, [pref])

  function choose(next: ThemePreference) {
    setPref(next)
    setThemePreference(next)
  }

  if (collapsed) {
    const index = THEME_OPTIONS.findIndex((o) => o.value === pref)
    const next = THEME_OPTIONS[(index + 1) % THEME_OPTIONS.length]
    return (
      <IconButton label={`Giao diện: ${THEME_OPTIONS[index].label}. Bấm để đổi sang ${next.label}`}
        icon={THEME_OPTIONS[index].icon} onClick={() => choose(next.value)} className="w-full text-radiert" />
    )
  }

  // Chỉ icon (tên nằm ở title/aria-label): 3 nhãn chữ không vừa bề rộng sidebar.
  return (
    <div className="flex items-center justify-between gap-2 px-3">
      <span className="text-sm text-radiert">Giao diện</span>
      <Segmented label="Giao diện" value={pref} onChange={(v) => choose(v as ThemePreference)}
        options={THEME_OPTIONS.map((o) => ({ value: o.value, label: o.icon, title: o.label }))} />
    </div>
  )
}

function SidebarContent({
  collapsed,
  streak,
  dueCount,
  onNavigate,
  onToggleCollapse,
}: {
  collapsed: boolean
  streak: Streak | null
  dueCount: number
  onNavigate?: () => void
  onToggleCollapse?: () => void
}) {
  const { user } = useAuth()
  const learn: NavEntry[] = [
    { to: '/app', label: 'Trang chủ', icon: <House />, end: true },
    { to: '/app/review', label: 'Ôn tập', icon: <Repeat2 />, badge: dueCount },
    { to: '/app/vocabulary', label: 'Từ vựng', icon: <BookOpen /> },
    { to: '/app/listening', label: 'Nghe', icon: <Headphones /> },
    { to: '/app/speaking', label: 'Nói', icon: <Mic /> },
    { to: '/app/reading', label: 'Đọc', icon: <BookOpenText /> },
    { to: '/app/writing', label: 'Viết', icon: <PencilLine /> },
    // Thước kẻ: ngữ pháp là bộ "quy tắc dựng câu".
    { to: '/app/grammar', label: 'Ngữ pháp', icon: <Ruler /> },
  ]
  const personal: NavEntry[] = [{ to: '/app/decks', label: 'Bộ từ của tôi', icon: <Layers /> }]
  const groupLabel = 'mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-hauch'

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center', collapsed ? 'justify-center' : 'px-6')}>
        <Link to="/app" onClick={onNavigate} className={cn('rounded-karte font-display text-lg font-bold text-bleistift', focusRing)} title="DeutschPfad">
          {collapsed ? (
            <span aria-label="DeutschPfad">
              D<span className="text-reiter-tief">P</span>
            </span>
          ) : (
            <>
              Deutsch<span className="text-reiter-tief">Pfad</span>
            </>
          )}
        </Link>
      </div>

      <nav aria-label="Điều hướng chính" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {!collapsed && <p className={cn(groupLabel, 'mt-1')}>Học</p>}
        <div className="space-y-0.5">
          {learn.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
        {collapsed ? <div className="mx-2 my-3 border-t border-linie" /> : <p className={groupLabel}>Cá nhân</p>}
        <div className="space-y-0.5">
          {personal.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="shrink-0 space-y-2 border-t border-linie px-3 py-3">
        {collapsed ? (
          streak && (
            <div className="flex justify-center">
              <StreakBadge streak={streak} compact />
            </div>
          )
        ) : (
          <div className="flex items-center justify-between gap-2 px-1">
            {streak ? <StreakBadge streak={streak} /> : <span />}
            <StudyTimeBadge />
          </div>
        )}

        <SidebarLink item={{ to: '/app/profile', label: user?.fullName?.trim() || 'Hồ sơ', icon: <User /> }}
          collapsed={collapsed} onNavigate={onNavigate} />

        <ThemeSwitcher collapsed={collapsed} />

        {onToggleCollapse && (
          <Button variant="ghost" onClick={onToggleCollapse} aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            className={cn('w-full font-normal text-radiert', collapsed ? 'px-0' : 'justify-start px-3')}>
            {collapsed ? <ChevronRight className="size-4.5" aria-hidden="true" /> : <ChevronLeft className="size-4.5" aria-hidden="true" />}
            {!collapsed && 'Thu gọn'}
          </Button>
        )}
      </div>
    </div>
  )
}

const COLLAPSED_STORAGE_KEY = 'deutschpfad.sidebarCollapsed'

// Trang luyện tập có cột riêng (danh sách chế độ, danh sách câu) — để sidebar mở đầy đủ thì thành 3
// cột, nội dung chính bị ép hẹp. Ở các trang này sidebar tự thu thành dải icon; người dùng vẫn mở
// rộng được, và lựa chọn đó chỉ giữ tới khi rời trang.
const FOCUS_ROUTE =
  /^\/app\/(practice\/[^/]+|decks\/[^/]+\/practice|listening\/(?!mine(\/|$))[^/]+|reading\/(?!articles$|mine$)[^/]+)$/

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function AppLayout() {
  const location = useLocation()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [collapsedPref, setCollapsedPref] = useState(readCollapsed)
  const [expandedOnFocusRoute, setExpandedOnFocusRoute] = useState<string | null>(null)
  const [drawerPath, setDrawerPath] = useState<string | null>(null)

  const onFocusRoute = FOCUS_ROUTE.test(location.pathname)
  const collapsed = onFocusRoute ? expandedOnFocusRoute !== location.pathname : collapsedPref
  // Ngăn kéo gắn với trang lúc mở: điều hướng sang trang khác (kể cả nút Back) là tự đóng.
  const drawerOpen = drawerPath === location.pathname

  useEffect(() => {
    getStreak().then(setStreak).catch(() => {})
  }, [])

  // Số thẻ đến hạn trên mục "Ôn tập": lấy lại mỗi lần đổi trang, để sau một phiên ôn con số giảm ngay.
  useEffect(() => {
    getVocabularyStats()
      .then((stats) => setDueCount(stats.dueForReview))
      .catch(() => {})
  }, [location.pathname])

  function toggleCollapse() {
    if (onFocusRoute) {
      setExpandedOnFocusRoute(collapsed ? location.pathname : null)
      return
    }
    const next = !collapsedPref
    setCollapsedPref(next)
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next))
    } catch {
      // không lưu được thì chỉ áp dụng cho phiên này
    }
  }

  return (
    <StudyTimeProvider>
      <div className="min-h-screen md:flex">
        {/* Thanh bên là một tấm thẻ dựng cạnh hộp: nền thẻ, mép phải là mép thẻ. */}
        <aside className={cn('sticky top-0 z-nav hidden h-screen shrink-0 border-r border-kartenrand bg-karteikarte transition-[width] duration-200 md:block',
          collapsed ? 'w-16' : 'w-60')}>
          <SidebarContent collapsed={collapsed} streak={streak} dueCount={dueCount} onToggleCollapse={toggleCollapse} />
        </aside>

        {/* Điện thoại: thanh trên mỏng + ngăn kéo trượt từ trái (không đủ chỗ cho sidebar cố định). */}
        <header className="sticky top-0 z-nav flex items-center justify-between border-b border-kartenrand bg-karteikarte px-2 py-1.5 md:hidden">
          <div className="flex items-center gap-1">
            <IconButton label="Mở menu" icon={<Menu className="size-5" aria-hidden="true" />} aria-expanded={drawerOpen}
              onClick={() => setDrawerPath(location.pathname)} />
            <Link to="/app" className={cn('rounded-karte font-display text-lg font-bold text-bleistift', focusRing)}>
              Deutsch<span className="text-reiter-tief">Pfad</span>
            </Link>
          </div>
          {streak && <StreakBadge streak={streak} />}
        </header>

        <Drawer open={drawerOpen} onClose={() => setDrawerPath(null)} label="Menu" className="md:hidden">
          <SidebarContent collapsed={false} streak={streak} dueCount={dueCount} onNavigate={() => setDrawerPath(null)} />
        </Drawer>

        <div className="min-w-0 flex-1">
          <BreakReminderBanner />
          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
        <TutorChatWidget />
      </div>
    </StudyTimeProvider>
  )
}
