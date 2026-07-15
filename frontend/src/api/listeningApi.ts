import { apiFetch } from './client'
import type {
  ListeningExerciseAdmin,
  ListeningExerciseDetail,
  ListeningExerciseSummary,
  ShadowingFeedback,
  WordTranslation,
} from './types'

export function listListeningByLevel(level: string, topic?: string) {
  const query = topic ? `&topic=${encodeURIComponent(topic)}` : ''
  return apiFetch<ListeningExerciseSummary[]>(`/listening?level=${level}${query}`)
}

export function listListeningTopics() {
  return apiFetch<string[]>('/listening/topics')
}

export function recordListeningProgress() {
  return apiFetch<void>('/listening/progress', { method: 'POST' })
}

export function getListeningExercise(id: number) {
  return apiFetch<ListeningExerciseDetail>(`/listening/${id}`)
}

export function getShadowingFeedback(sentenceId: number, audio: Blob) {
  const formData = new FormData()
  formData.append('audio', audio, 'recording.webm')
  return apiFetch<ShadowingFeedback>(`/listening/sentences/${sentenceId}/shadowing-feedback`, {
    method: 'POST',
    body: formData,
  })
}

export function getWordTranslation(sentenceId: number, word: string) {
  return apiFetch<WordTranslation>(`/listening/sentences/${sentenceId}/word-translation?word=${encodeURIComponent(word)}`)
}

export type ListeningExerciseAdminRequest = {
  title: string
  levelMin: string
  levelMax: string
  youtubeVideoId: string
  description: string | null
  topic: string | null
  orderIndex: number
  rawTranscript: string | null
  autoFetch: boolean
}

/**
 * Accepts a raw 11-char video ID or any common YouTube URL shape (share link, watch link,
 * embed link, with or without extra query params like `?si=...`) and returns just the ID.
 * Falls back to the trimmed input unchanged if nothing recognizable is found.
 */
export function extractYoutubeVideoId(input: string): string {
  const trimmed = input.trim()
  const patterns = [
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  return trimmed
}

export function getYoutubeVideoTitle(videoId: string) {
  return apiFetch<{ title: string | null }>(`/user-listening-items/video-title?videoId=${videoId}`)
}

export function listListeningAdmin() {
  return apiFetch<ListeningExerciseAdmin[]>('/admin/listening-exercises')
}

export function createListeningExercise(request: ListeningExerciseAdminRequest) {
  return apiFetch<ListeningExerciseAdmin>('/admin/listening-exercises', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateListeningExercise(id: number, request: ListeningExerciseAdminRequest) {
  return apiFetch<ListeningExerciseAdmin>(`/admin/listening-exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteListeningExercise(id: number) {
  return apiFetch<void>(`/admin/listening-exercises/${id}`, { method: 'DELETE' })
}
