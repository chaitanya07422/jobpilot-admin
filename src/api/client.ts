import { getAdminKey } from '@/lib/adminKey'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/** In dev, use Vite proxy (`/api`) so Bull Board cookies work in the iframe */
function apiBase(): string {
  return import.meta.env.DEV ? '' : API_URL.replace(/\/$/, '')
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
  error?: { code: string; message: string }
}

export async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const adminKey = getAdminKey()

  if (!adminKey) {
    throw new ApiError('Not authenticated', 401)
  }

  const res = await fetch(`${apiBase()}/api/v1${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
      ...(options.headers ?? {}),
    },
  })

  if (res.status === 204) {
    if (!res.ok) {
      throw new ApiError(`Request failed (${res.status})`, res.status)
    }
    return undefined as T
  }

  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T>

  if (!res.ok) {
    throw new ApiError(
      body.error?.message ?? body.message ?? `Request failed (${res.status})`,
      res.status,
    )
  }

  if (!body.success) {
    throw new ApiError(
      body.error?.message ?? body.message ?? 'Unexpected API response',
      res.status,
    )
  }

  return body.data as T
}
