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

// Chống gọi refresh trùng TRONG MỘT TAB: nhiều request cùng dính 401 thì chỉ refresh một lần,
// các request còn lại chờ chung kết quả đó.
let refreshPromise: Promise<boolean> | null = null

function refreshOnce(): Promise<boolean> {
  return fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((res) => res.ok)
    .catch(() => false)
}

function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    // Chống gọi refresh trùng GIỮA CÁC TAB. Biến refreshPromise ở trên chỉ sống trong một tab,
    // mà cookie refresh token thì dùng chung. Mở 2 tab, access token hết hạn → cả hai cùng gửi
    // đi CÙNG MỘT refresh token. Server coi đó là token đã xoay bị dùng lại (dấu hiệu bị đánh
    // cắp) và thu hồi cả phiên → người dùng bị đăng xuất oan ở mọi tab.
    //
    // Web Locks xếp hàng các tab: chỉ một tab refresh tại một thời điểm. Trình duyệt đọc cookie
    // lúc GỬI request, nên tab thứ hai tự động mang theo token MỚI mà tab thứ nhất vừa nhận về —
    // không còn "dùng lại" nào cả, và server giữ được chế độ nghiêm ngặt.
    //
    // navigator.locks chỉ có trong secure context (HTTPS hoặc localhost). Không có thì lùi về
    // cách cũ — chỉ chống trùng trong tab, vẫn chạy được.
    const run =
      'locks' in navigator
        ? navigator.locks.request('deutschpfad-token-refresh', refreshOnce)
        : refreshOnce()

    refreshPromise = run.finally(() => {
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
