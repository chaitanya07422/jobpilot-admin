export type JobCatalogStatus = 'active' | 'closed' | 'draft'

export interface AdminJob {
  id: string
  source: string
  externalId: string
  sourceUrl: string
  company: string
  role: string
  location: string
  isRemote: boolean
  description: string
  applyUrl: string
  requiredSkills: string[]
  salary?: string
  seniority?: string
  status: JobCatalogStatus
  discoveredAt: string
  lastSeenAt: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AdminJobList {
  items: AdminJob[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface JobSeedResult {
  created: number
  updated: number
  skipped: number
}

export interface CreateJobPayload {
  company: string
  role: string
  location: string
  isRemote?: boolean
  description: string
  applyUrl: string
  sourceUrl?: string
  requiredSkills?: string[]
  salary?: string
  seniority?: string
  status?: JobCatalogStatus
}

export type UpdateJobPayload = Partial<CreateJobPayload> & {
  status?: JobCatalogStatus
}
