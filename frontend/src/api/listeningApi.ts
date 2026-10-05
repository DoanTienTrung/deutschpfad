import { apiFetch } from './client'
import type {
  ListeningExerciseAdmin,
  ListeningExerciseDetail,
  ListeningExerciseSummary,
  ListeningKind,
  ListeningStatus,
  ShadowingFeedback,
  WordTranslation,
  YoutubeLibrary,
} from './types'

export function listListeningByLevel(level: string, topic?: string) {
  const query = topic ? `&topic=${encodeURIComponent(topic)}` : ''
  return apiFetch<ListeningExerciseSummary[]>(`/listening?level=${level}${query}`)
}

export function getYoutubeLibrary() {
  return apiFetch<YoutubeLibrary>('/listening/youtube')
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
  youtubeVideoId: string | null
  audioUrl: string | null
  sourceLabel: string | null
  sourceUrl: string | null
  description: string | null
  topic: string | null
  orderIndex: number
  rawTranscript: string | null
  autoFetch: boolean
  channelId: number | null
  kind: ListeningKind | null
  hidden: boolean | null
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

// ---------------------------------------------------------------- nhập video YouTube hàng loạt (admin)

export type ListeningChannelAdmin = {
  id: number
  name: string
  handle: string | null
  youtubeChannelId: string | null
  orderIndex: number
}

export type CatalogVideo = {
  channelName: string
  videoId: string
  title: string
  levelMin: string
  levelMax: string
  durationSeconds: number | null
  exists: boolean
}

export type PlaylistPreviewEntry = {
  videoId: string
  title: string
  durationSeconds: number | null
  exists: boolean
}

export type ListeningImportStatus = {
  running: boolean
  phase: string | null
  stopReason: string | null
  videosProcessed: number
  videosFailed: number
  videosReady: number
  sentencesTranslated: number
  sentencesRemaining: number
  byStatus: Record<ListeningStatus, number>
  maxVideosPerRun: number
  maxSentencesPerRun: number
}

export function listListeningChannels() {
  return apiFetch<ListeningChannelAdmin[]>('/admin/listening-import/channels')
}

export function getListeningCatalog() {
  return apiFetch<CatalogVideo[]>('/admin/listening-import/catalog')
}

export function applyListeningCatalog() {
  return apiFetch<{ created: number }>('/admin/listening-import/catalog/apply', { method: 'POST' })
}

export function previewPlaylist(url: string, limit: number) {
  return apiFetch<PlaylistPreviewEntry[]>('/admin/listening-import/preview', {
    method: 'POST',
    body: JSON.stringify({ url, limit }),
  })
}

export function enqueueListeningVideos(request: {
  channelId: number | null
  levelMin: string
  levelMax: string
  videos: { videoId: string; title: string; durationSeconds: number | null }[]
}) {
  return apiFetch<{ created: number }>('/admin/listening-import', { method: 'POST', body: JSON.stringify(request) })
}

export function runListeningImport() {
  return apiFetch<{ started: boolean }>('/admin/listening-import/run', { method: 'POST' })
}

export function getListeningImportStatus() {
  return apiFetch<ListeningImportStatus>('/admin/listening-import/status')
}

export function retryListeningImport(id: number) {
  return apiFetch<void>(`/admin/listening-import/${id}/retry`, { method: 'POST' })
}
