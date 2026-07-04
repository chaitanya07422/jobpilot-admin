import { adminFetch } from '@/api/client'

/** Sets httpOnly cookie on API so Bull Board iframe can authenticate */
export async function bootstrapQueueDashboardSession(): Promise<void> {
  await adminFetch<null>('/admin/queues/session', { method: 'POST' })
}

export function getQueueDashboardUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
  return `${apiUrl.replace(/\/$/, '')}/api/v1/admin/queues`
}

/** Same-origin path when Vite dev proxy is enabled */
export function getQueueDashboardEmbedUrl(): string {
  if (import.meta.env.DEV) {
    return '/api/v1/admin/queues'
  }
  return getQueueDashboardUrl()
}
