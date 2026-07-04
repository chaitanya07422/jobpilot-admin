import { adminFetch } from '@/api/client'
import type {
  CreateSourcePayload,
  IngestSource,
  IngestSyncResult,
  UpdateSourcePayload,
} from '@/types/source.types'

export const adminSourcesApi = {
  list: () => adminFetch<IngestSource[]>('/admin/job-sources'),

  get: (id: string) => adminFetch<IngestSource>(`/admin/job-sources/${id}`),

  create: (payload: CreateSourcePayload) =>
    adminFetch<IngestSource>('/admin/job-sources', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateSourcePayload) =>
    adminFetch<IngestSource>(`/admin/job-sources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    adminFetch<null>(`/admin/job-sources/${id}`, { method: 'DELETE' }),

  sync: (id: string) =>
    adminFetch<IngestSyncResult>(`/admin/job-sources/${id}/sync`, {
      method: 'POST',
    }),
}
