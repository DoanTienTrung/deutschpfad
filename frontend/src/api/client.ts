const API_BASE = '/api'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    super(`API error ${status}`)
    this.status = status
    this.data = data
  }
}

let refreshPromise: Promise<boolean> | null = null

function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<T> {
  const isFormData = options.body instanceof FormData
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      // Omit Content-Type for FormData so the browser can set the multipart boundary itself.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })

  if (res.status === 401 && allowRetry && !NO_REFRESH_PATHS.includes(path)) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return apiFetch<T>(path, options, false)
    }
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(res.status, data)
  }

  return data as T
}
