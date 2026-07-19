export function formatStudyTime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} phút`
  return `${hours} giờ ${minutes} phút`
}

// Live-ticking clock format (mm:ss, or h:mm:ss past an hour) for the header badge -- distinct from
// formatStudyTime's coarser "X phút"/"X giờ Y phút" used for the profile page's today/week/total summary.
export function formatStudyTimeClock(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const mm = minutes.toString().padStart(hours > 0 ? 2 : 1, '0')
  const ss = secs.toString().padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}
