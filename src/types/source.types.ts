export type IngestProvider = 'greenhouse' | 'lever' | 'ashby'

export type SyncStatus = 'idle' | 'running' | 'success' | 'error'

export interface IngestSyncStats {
  fetched: number
  created: number
  updated: number
  closed: number
}

export interface IngestSource {
  id: string
  provider: IngestProvider
  identifier: string
  displayName: string
  enabled: boolean
  defaultRemote: boolean
  defaultLocation?: string
  lastSyncStatus: SyncStatus
  lastSyncedAt?: string
  lastSyncError?: string
  lastSyncStats?: IngestSyncStats
  createdAt: string
  updatedAt: string
}

export interface CreateSourcePayload {
  provider: IngestProvider
  identifier: string
  displayName: string
  enabled?: boolean
  defaultRemote?: boolean
  defaultLocation?: string
}

export type UpdateSourcePayload = Partial<CreateSourcePayload>

export interface IngestSyncResult {
  sourceId: string
  provider: string
  identifier: string
  fetched: number
  created: number
  updated: number
  closed: number
}
