import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { adminSourcesApi } from '@/api/sources.api'
import type { CreateSourcePayload, IngestProvider } from '@/types/source.types'

const providers: { value: IngestProvider; label: string; hint: string }[] = [
  {
    value: 'greenhouse',
    label: 'Greenhouse',
    hint: 'Board token, e.g. "stripe" from boards.greenhouse.io/stripe',
  },
  {
    value: 'lever',
    label: 'Lever',
    hint: 'Company slug, e.g. "netflix" from jobs.lever.co/netflix',
  },
  {
    value: 'ashby',
    label: 'Ashby',
    hint: 'Org slug, e.g. "openai" from jobs.ashbyhq.com/openai',
  },
]

const emptyForm: CreateSourcePayload = {
  provider: 'greenhouse',
  identifier: '',
  displayName: '',
  enabled: true,
  defaultRemote: false,
  defaultLocation: '',
}

export default function SourceFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreateSourcePayload>(emptyForm)

  const { data: source, isLoading } = useQuery({
    queryKey: ['admin-source', id],
    queryFn: () => adminSourcesApi.get(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!source) return
    setForm({
      provider: source.provider,
      identifier: source.identifier,
      displayName: source.displayName,
      enabled: source.enabled,
      defaultRemote: source.defaultRemote,
      defaultLocation: source.defaultLocation ?? '',
    })
  }, [source])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateSourcePayload = {
        ...form,
        identifier: form.identifier.trim(),
        displayName: form.displayName.trim(),
        defaultLocation: form.defaultLocation?.trim() || undefined,
      }
      if (isEdit && id) {
        return adminSourcesApi.update(id, payload)
      }
      return adminSourcesApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] })
      navigate('/sources')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminSourcesApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] })
      navigate('/sources')
    },
  })

  if (isEdit && isLoading) {
    return <p className="text-sm text-muted">Loading source…</p>
  }

  const activeProvider = providers.find((p) => p.value === form.provider)

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/sources"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sources
      </Link>

      <div>
        <h2 className="font-heading text-xl font-semibold">
          {isEdit ? 'Edit source' : 'Add source'}
        </h2>
        <p className="text-sm text-muted mt-1">
          Configure a public job board to ingest from
        </p>
      </div>

      <form
        className="space-y-4 rounded-xl border border-border bg-panel p-6"
        onSubmit={(e) => {
          e.preventDefault()
          saveMutation.mutate()
        }}
      >
        <Field label="Provider">
          <select
            value={form.provider}
            onChange={(e) =>
              setForm((f) => ({ ...f, provider: e.target.value as IngestProvider }))
            }
            className={inputClass}
          >
            {providers.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Board identifier">
          <input
            value={form.identifier}
            onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
            className={inputClass}
            required
            placeholder="stripe"
          />
          {activeProvider && (
            <p className="mt-1 text-xs text-muted">{activeProvider.hint}</p>
          )}
        </Field>

        <Field label="Display name">
          <input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            className={inputClass}
            required
            placeholder="Stripe"
          />
        </Field>

        <Field label="Default location (fallback when the board omits one)">
          <input
            value={form.defaultLocation ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultLocation: e.target.value }))
            }
            className={inputClass}
            placeholder="Remote"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.enabled ?? true}
            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
          />
          Enabled
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.defaultRemote ?? false}
            onChange={(e) =>
              setForm((f) => ({ ...f, defaultRemote: e.target.checked }))
            }
          />
          Treat postings as remote by default
        </label>

        {saveMutation.isError && (
          <p className="text-sm text-red">
            {saveMutation.error instanceof Error
              ? saveMutation.error.message
              : 'Save failed'}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save source'}
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this source? Ingested jobs are kept.')) {
                  deleteMutation.mutate()
                }
              }}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-red/30 px-4 py-2 text-sm text-red"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-border bg-panel-secondary px-3 py-2 text-sm outline-none focus:border-cyan/50'
