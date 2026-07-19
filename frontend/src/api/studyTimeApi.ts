import { apiFetch } from './client'

export type StudyTimeSummary = {
  todaySeconds: number
  weekSeconds: number
  totalSeconds: number
}

export function sendStudyTimeHeartbeat(seconds: number) {
  return apiFetch<void>('/study-time/heartbeat', {
    method: 'POST',
    body: JSON.stringify({ seconds }),
  })
}

export function getStudyTimeSummary() {
  return apiFetch<StudyTimeSummary>('/study-time/summary')
}
