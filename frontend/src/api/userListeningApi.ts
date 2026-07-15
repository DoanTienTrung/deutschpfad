import { apiFetch } from './client'
import type { ShadowingFeedback, UserListeningItemDetail, UserListeningItemSummary, WordTranslation } from './types'

export type UserListeningItemRequest = {
  title: string
  youtubeVideoId: string
  description: string | null
  rawTranscript: string | null
  autoFetch: boolean
}

export function getYoutubeVideoTitle(videoId: string) {
  return apiFetch<{ title: string | null }>(`/user-listening-items/video-title?videoId=${videoId}`)
}

export function listMyListeningItems() {
  return apiFetch<UserListeningItemSummary[]>('/user-listening-items')
}

export function getMyListeningItem(id: number) {
  return apiFetch<UserListeningItemDetail>(`/user-listening-items/${id}`)
}

export function createMyListeningItem(request: UserListeningItemRequest) {
  return apiFetch<UserListeningItemDetail>('/user-listening-items', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateMyListeningItem(id: number, request: UserListeningItemRequest) {
  return apiFetch<UserListeningItemDetail>(`/user-listening-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteMyListeningItem(id: number) {
  return apiFetch<void>(`/user-listening-items/${id}`, { method: 'DELETE' })
}

export function getMyShadowingFeedback(sentenceId: number, audio: Blob) {
  const formData = new FormData()
  formData.append('audio', audio, 'recording.webm')
  return apiFetch<ShadowingFeedback>(`/user-listening-items/sentences/${sentenceId}/shadowing-feedback`, {
    method: 'POST',
    body: formData,
  })
}

export function getMyWordTranslation(sentenceId: number, word: string) {
  return apiFetch<WordTranslation>(
    `/user-listening-items/sentences/${sentenceId}/word-translation?word=${encodeURIComponent(word)}`
  )
}
