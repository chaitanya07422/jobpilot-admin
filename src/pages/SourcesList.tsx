import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { adminSourcesApi } from '@/api/sources.api'
import type { IngestSyncResult, SyncStatus } from '@/types/source.types'

const statusStyles: Record<SyncStatus, string> = {
  idle: 'bg-panel-secondary text-muted',
  running: 'bg-amber/10 text-amber',
  success: 'bg-green/10 text-green',
  error: 'bg-red/10 text-red',
}

export default function SourcesListPage() {
  const queryClient = useQueryClient()
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<IngestSyncResult | null>(null)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: adminSourcesApi.list,
  })

  const syncMutation = useMutation({
    mutationFn: (id: string) => adminSourcesApi.sync(id),
    onMutate: (id: string) => {
      setSyncingId(id)
      setLastResult(null)
    },
    onSuccess: (result) => {
      setLastResult(result)
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] })
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
    onSettled: () => {
      setSyncingId(null)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Job sources</h2>
          <p className="text-sm text-muted mt-1">
            Public job boards ingested into the catalog
          </p>
        </div>
        <Link
          to="/sources/new"
          className="inline-flex items-center gap-2 rounded-lg bg-cyan px-3 py-2 text-sm font-medium text-background"
        >
          <Plus className="h-4 w-4" />
          Add source
        </Link>
      </div>

      {lastResult && (
        <p className="text-sm text-green">
          Sync done: {lastResult.fetched} fetched, {lastResult.created} created,{' '}
          {lastResult.updated} updated, {lastResult.closed} closed
        </p>
      )}

      {syncMutation.isError && (
        <p className="text-sm text-red">
          {syncMutation.error instanceof Error
            ? syncMutation.error.message
            : 'Sync failed'}
        </p>
      )}

      {isLoading && <p className="text-sm text-muted">Loading sources…</p>}
      {isError && (
        <div className="rounded-lg border border-red/30 bg-red/5 p-4 text-sm">
          <p>{error instanceof Error ? error.message : 'Failed to load sources'}</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-cyan">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-panel-secondary text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Identifier</th>
                  <th className="px-4 py-3 font-medium">Enabled</th>
                  <th className="px-4 py-3 font-medium">Last sync</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted">
                      No sources yet. Add a Greenhouse, Lever, or Ashby board.
                    </td>
                  </tr>
                ) : (
                  data.map((source) => (
                    <tr key={source.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{source.displayName}</td>
                      <td className="px-4 py-3 capitalize text-muted">
                        {source.provider}
                      </td>
                      <td className="px-4 py-3 text-muted">{source.identifier}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs ${
                            source.enabled
                              ? 'bg-green/10 text-green'
                              : 'bg-panel-secondary text-muted'
                          }`}
                        >
                          {source.enabled ? 'enabled' : 'disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs ${statusStyles[source.lastSyncStatus]}`}
                        >
                          {source.lastSyncStatus}
                        </span>
                        {source.lastSyncedAt && (
                          <span className="ml-2 text-xs text-muted">
                            {new Date(source.lastSyncedAt).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {source.lastSyncStats
                          ? `${source.lastSyncStats.fetched}f / ${source.lastSyncStats.created}c / ${source.lastSyncStats.updated}u / ${source.lastSyncStats.closed}x`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => syncMutation.mutate(source.id)}
                            disabled={syncingId === source.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-panel-secondary disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 ${syncingId === source.id ? 'animate-spin' : ''}`}
                            />
                            {syncingId === source.id ? 'Syncing…' : 'Sync now'}
                          </button>
                          <Link
                            to={`/sources/${source.id}`}
                            className="text-cyan hover:underline"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-4 py-3 text-xs text-muted">
            {data.length} source{data.length === 1 ? '' : 's'} · f=fetched, c=created,
            u=updated, x=closed
          </div>
        </div>
      )}
    </div>
  )
}
