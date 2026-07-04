import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  bootstrapQueueDashboardSession,
  getQueueDashboardEmbedUrl,
} from '@/api/queues.api'
import { ApiError } from '@/api/client'

export default function QueuesDashboardPage() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void bootstrapQueueDashboardSession()
      .then(() => {
        if (!cancelled) {
          setReady(true)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? err.message
              : 'Could not start queue dashboard session'
          setError(message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error}
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading queue dashboard…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Queue dashboard</h1>
        <p className="text-sm text-muted">
          BullMQ queue <code className="text-cyan">apply</code> — auto-apply jobs
          from Accept.
        </p>
      </div>
      <iframe
        title="BullMQ dashboard"
        src={getQueueDashboardEmbedUrl()}
        className="h-[calc(100vh-12rem)] w-full rounded-xl border border-border bg-panel"
      />
    </div>
  )
}
