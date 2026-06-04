const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // No Bearer header needed — cookies are sent automatically via credentials: 'include'
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',  // Send cookies automatically
  })

  if (res.status === 401) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      return request<T>(path, options)
    }
    window.location.href = '/login'
    throw new ApiError(401, 'Session expirée')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, error.detail ?? 'Erreur serveur')
  }

  if (res.status === 204) return {} as T
  return res.json()
}

async function attemptRefresh(): Promise<boolean> {
  // Refresh via cookie — the httpOnly refresh_token cookie is sent automatically
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
