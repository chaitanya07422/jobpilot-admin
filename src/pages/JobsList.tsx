import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Database, Plus } from 'lucide-react'
import { adminJobsApi } from '@/api/jobs.api'
import { useState } from 'react'

export default function JobsListPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'all' | 'active' | 'closed' | 'draft'>('all')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-jobs', status],
    queryFn: () =>
      adminJobsApi.list({
        limit: 50,
        status: status === 'all' ? undefined : status,
      }),
  })

  const seedMutation = useMutation({
    mutationFn: adminJobsApi.seed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Jobs</h2>
          <p className="text-sm text-muted mt-1">
            Manage the job catalog before matching goes live
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-panel-secondary disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {seedMutation.isPending ? 'Seeding…' : 'Seed sample jobs'}
          </button>
          <Link
            to="/jobs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan px-3 py-2 text-sm font-medium text-background"
          >
            <Plus className="h-4 w-4" />
            Add job
          </Link>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'closed', 'draft'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
              status === value
                ? 'bg-cyan/15 text-cyan border border-cyan/30'
                : 'border border-border text-muted'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {seedMutation.isSuccess && (
        <p className="text-sm text-green">
          Seed done: {seedMutation.data.created} created, {seedMutation.data.updated} updated,{' '}
          {seedMutation.data.skipped} skipped
        </p>
      )}

      {isLoading && <p className="text-sm text-muted">Loading jobs…</p>}
      {isError && (
        <div className="rounded-lg border border-red/30 bg-red/5 p-4 text-sm">
          <p>{error instanceof Error ? error.message : 'Failed to load jobs'}</p>
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
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted">
                      No jobs yet. Seed sample jobs or add one manually.
                    </td>
                  </tr>
                ) : (
                  data.items.map((job) => (
                    <tr key={job.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{job.company}</td>
                      <td className="px-4 py-3">{job.role}</td>
                      <td className="px-4 py-3 text-muted">{job.location}</td>
                      <td className="px-4 py-3 text-muted">{job.source}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs ${
                            job.status === 'active'
                              ? 'bg-green/10 text-green'
                              : job.status === 'closed'
                                ? 'bg-red/10 text-red'
                                : 'bg-amber/10 text-amber'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/jobs/${job.id}`} className="text-cyan hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-4 py-3 text-xs text-muted">
            {data.total} job{data.total === 1 ? '' : 's'}
          </div>
        </div>
      )}
    </div>
  )
}
