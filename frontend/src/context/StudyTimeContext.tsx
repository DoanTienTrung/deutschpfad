import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { getStudyTimeSummary, sendStudyTimeHeartbeat } from '../api/studyTimeApi'

const HEARTBEAT_INTERVAL_MS = 30_000
const BREAK_REMINDER_INTERVAL_SECONDS = 45 * 60
const BREAK_REMINDER_AUTO_HIDE_MS = 12_000

const BREAK_REMINDER_MESSAGES = [
  'ơi, bạn đã học 45 phút rồi — uống nước và nghỉ mắt một chút nhé! 💧',
  'ơi, học liên tục 45 phút rồi, đứng dậy vươn vai vài phút rồi học tiếp nhé! 🧘',
  'ơi, 45 phút trôi qua rồi đó — nghỉ ngơi ngắn để não bộ "sạc pin" nhé! ⏸️',
  'ơi, học 45 phút rồi, nhìn ra xa vài giây cho mắt đỡ mỏi nhé! 👀',
]

type StudyTimeContextValue = {
  // Today's total in seconds, ticking up live while the tab is visible and focused.
  todaySeconds: number
  // Non-null right after crossing each 45-minute mark of today's cumulative study time (45, 90, 135...).
  breakReminderMessage: string | null
  dismissBreakReminder: () => void
}

const StudyTimeContext = createContext<StudyTimeContextValue | null>(null)

function isActive() {
  return document.visibilityState === 'visible' && document.hasFocus()
}

export function StudyTimeProvider({ children }: { children: ReactNode }) {
  const [todaySeconds, setTodaySeconds] = useState(0)
  const [breakReminderMessage, setBreakReminderMessage] = useState<string | null>(null)
  // Seconds accumulated since the last heartbeat was sent -- flushed to the server periodically
  // rather than on every tick, so we're not hammering the API once a second.
  const unsentSecondsRef = useRef(0)
  // Which 45-minute multiple was last announced, so we fire exactly once per crossing rather
  // than every tick while todaySeconds sits past the threshold.
  const lastAnnouncedThresholdRef = useRef(0)
  const autoHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function dismissBreakReminder() {
    setBreakReminderMessage(null)
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current)
      autoHideTimeoutRef.current = null
    }
  }

  useEffect(() => {
    getStudyTimeSummary()
      .then((summary) => {
        setTodaySeconds(summary.todaySeconds)
        // Don't fire an immediate reminder for a threshold already crossed in an earlier
        // session today -- only future crossings during this page visit should announce.
        lastAnnouncedThresholdRef.current = Math.floor(summary.todaySeconds / BREAK_REMINDER_INTERVAL_SECONDS)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const tick = setInterval(() => {
      if (!isActive()) return
      setTodaySeconds((s) => {
        const next = s + 1
        const threshold = Math.floor(next / BREAK_REMINDER_INTERVAL_SECONDS)
        if (threshold > lastAnnouncedThresholdRef.current) {
          lastAnnouncedThresholdRef.current = threshold
          setBreakReminderMessage(BREAK_REMINDER_MESSAGES[Math.floor(Math.random() * BREAK_REMINDER_MESSAGES.length)])
          if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current)
          autoHideTimeoutRef.current = setTimeout(() => setBreakReminderMessage(null), BREAK_REMINDER_AUTO_HIDE_MS)
        }
        return next
      })
      unsentSecondsRef.current += 1
    }, 1000)

    const flush = setInterval(() => {
      const seconds = unsentSecondsRef.current
      if (seconds <= 0) return
      unsentSecondsRef.current = 0
      sendStudyTimeHeartbeat(seconds).catch(() => {
        // best-effort -- lost heartbeats just mean a slightly-undercounted total, not worth retrying
      })
    }, HEARTBEAT_INTERVAL_MS)

    function flushOnUnload() {
      if (unsentSecondsRef.current <= 0) return
      // Fire-and-forget beacon so the last few seconds aren't lost when the tab closes --
      // a normal fetch() can get cancelled mid-flight during unload.
      navigator.sendBeacon?.(
        '/api/study-time/heartbeat',
        new Blob([JSON.stringify({ seconds: unsentSecondsRef.current })], { type: 'application/json' })
      )
      unsentSecondsRef.current = 0
    }
    window.addEventListener('beforeunload', flushOnUnload)

    return () => {
      clearInterval(tick)
      clearInterval(flush)
      window.removeEventListener('beforeunload', flushOnUnload)
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current)
    }
  }, [])

  return (
    <StudyTimeContext.Provider value={{ todaySeconds, breakReminderMessage, dismissBreakReminder }}>
      {children}
    </StudyTimeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook must live alongside its provider
export function useStudyTime() {
  const ctx = useContext(StudyTimeContext)
  if (!ctx) throw new Error('useStudyTime phải dùng bên trong StudyTimeProvider')
  return ctx
}
