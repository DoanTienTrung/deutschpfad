import { apiFetch } from './client'

export type DayCount = { date: string; value: number }

export type ContinueItem = {
  type: 'LESSON' | 'GRAMMAR'
  title: string
  subtitle: string
  href: string
  progress: number
  progressTotal: number
}

export type Dashboard = {
  dailyGoalMinutes: number
  streak: { current: number; longest: number }
  vocabulary: {
    total: number
    notYet: number
    learning: number
    known: number
    longTerm: number
    newThisWeek: number
    dueToday: number
  }
  studyTime: { last14Days: DayCount[]; thisWeekSeconds: number; lastWeekSeconds: number }
  grammar: { mastered: number; totalTopics: number }
  reviewForecast: DayCount[]
  continueLearning: ContinueItem[]
  onboarding: { learnedFirstWords: boolean; reviewedOnLaterDay: boolean }
}

export const getDashboard = () => apiFetch<Dashboard>('/dashboard')

export const setDailyGoal = (minutes: number) =>
  apiFetch<{ minutes: number }>('/dashboard/daily-goal', { method: 'PUT', body: JSON.stringify({ minutes }) })
