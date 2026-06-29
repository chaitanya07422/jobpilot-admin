import { adminFetch } from '@/api/client'
import type {
  AdminJob,
  AdminJobList,
  CreateJobPayload,
  JobSeedResult,
  JobCatalogStatus,
  UpdateJobPayload,
} from '@/types/job.types'

export const adminJobsApi = {
  list: (params?: { page?: number; limit?: number; status?: JobCatalogStatus }) => {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.status) search.set('status', params.status)
    const query = search.toString()
    return adminFetch<AdminJobList>(`/admin/jobs${query ? `?${query}` : ''}`)
  },

  get: (id: string) => adminFetch<AdminJob>(`/admin/jobs/${id}`),

  create: (payload: CreateJobPayload) =>
    adminFetch<AdminJob>('/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateJobPayload) =>
    adminFetch<AdminJob>(`/admin/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  close: (id: string) =>
    adminFetch<AdminJob>(`/admin/jobs/${id}/close`, { method: 'POST' }),

  remove: (id: string) =>
    adminFetch<null>(`/admin/jobs/${id}`, { method: 'DELETE' }),

  seed: () => adminFetch<JobSeedResult>('/admin/jobs/seed', { method: 'POST' }),
}
