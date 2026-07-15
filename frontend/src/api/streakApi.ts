import { apiFetch } from './client'
import type { Streak } from './types'

export function getStreak() {
  return apiFetch<Streak>('/streak')
}
