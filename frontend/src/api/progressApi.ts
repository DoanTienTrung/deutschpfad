import { apiFetch } from './client'
import type { HeatmapDay, ProgressSummary } from './types'

export type PracticeMode =
  | 'FLASHCARD'
  | 'MULTIPLE_CHOICE'
  | 'MATCH'
  | 'LISTEN'
  | 'TYPE'
  | 'DICTATION'
  | 'LESSON_COMPLETE'

export function getLessonProgress(lessonId: number) {
  return apiFetch<PracticeMode[]>(`/lessons/${lessonId}/progress`)
}

export function markLessonModeComplete(lessonId: number, mode: PracticeMode) {
  return apiFetch<PracticeMode[]>(`/lessons/${lessonId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ mode }),
  })
}

export function markLessonComplete(lessonId: number) {
  return markLessonModeComplete(lessonId, 'LESSON_COMPLETE')
}

export function getProgressSummary() {
  return apiFetch<ProgressSummary[]>('/progress/summary')
}

export function getHeatmap() {
  return apiFetch<HeatmapDay[]>('/progress/heatmap')
}
