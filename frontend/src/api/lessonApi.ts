import { apiFetch } from './client'
import type { LessonSummary, VocabularyItem, VocabularySource } from './types'

export function listLessonsByLevel(level: string, source: VocabularySource = 'FREQUENCY') {
  return apiFetch<LessonSummary[]>(`/lessons?level=${level}&source=${source}`)
}

/** Mọi bài của một nguồn, không lọc cấp độ — bộ "Sống ở Đức" xếp theo tình huống. */
export function listLessonsBySource(source: VocabularySource) {
  return apiFetch<LessonSummary[]>(`/lessons?source=${source}`)
}

export function listLessonsByTopic(topicId: number) {
  return apiFetch<LessonSummary[]>(`/lessons?topicId=${topicId}`)
}

export function getLessonById(lessonId: number) {
  return apiFetch<LessonSummary>(`/lessons/${lessonId}`)
}

export function getLessonVocabularyItems(lessonId: number) {
  return apiFetch<VocabularyItem[]>(`/lessons/${lessonId}/vocabulary-items`)
}
