import { apiFetch } from './client'
import type { RecordingHistory, SpeakingPrompt, SpeakingSubmission } from './types'

export function listSpeakingByLevel(level: string) {
  return apiFetch<SpeakingPrompt[]>(`/speaking?level=${level}`)
}

export function getSpeakingPrompt(id: number) {
  return apiFetch<SpeakingPrompt>(`/speaking/${id}`)
}

export function getSpeakingHistory(id: number) {
  return apiFetch<RecordingHistory[]>(`/speaking/${id}/history`)
}

export function submitSpeakingRecording(id: number, audio: Blob) {
  const formData = new FormData()
  formData.append('audio', audio, 'recording.webm')
  return apiFetch<SpeakingSubmission>(`/speaking/${id}/submit`, {
    method: 'POST',
    body: formData,
  })
}

export function getTurnAudioUrl(turnId: number) {
  return `/api/speaking/turns/${turnId}/audio`
}

export type SpeakingPromptAdminRequest = {
  level: string
  promptText: string
  description: string | null
  orderIndex: number
}

export function listSpeakingAdmin() {
  return apiFetch<SpeakingPrompt[]>('/admin/speaking-prompts')
}

export function createSpeakingPrompt(request: SpeakingPromptAdminRequest) {
  return apiFetch<SpeakingPrompt>('/admin/speaking-prompts', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateSpeakingPrompt(id: number, request: SpeakingPromptAdminRequest) {
  return apiFetch<SpeakingPrompt>(`/admin/speaking-prompts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteSpeakingPrompt(id: number) {
  return apiFetch<void>(`/admin/speaking-prompts/${id}`, { method: 'DELETE' })
}
