import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { adminJobsApi } from '@/api/jobs.api'
import type { CreateJobPayload } from '@/types/job.types'

const emptyForm: CreateJobPayload = {
  company: '',
  role: '',
  location: '',
  isRemote: false,
  description: '',
  applyUrl: '',
  requiredSkills: [],
  salary: '',
}

export default function JobFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreateJobPayload>(emptyForm)
  const [skillsText, setSkillsText] = useState('')

  const { data: job, isLoading } = useQuery({
    queryKey: ['admin-job', id],
    queryFn: () => adminJobsApi.get(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!job) return
    setForm({
      company: job.company,
      role: job.role,
      location: job.location,
      isRemote: job.isRemote,
      description: job.description,
      applyUrl: job.applyUrl,
      sourceUrl: job.sourceUrl,
      requiredSkills: job.requiredSkills,
      salary: job.salary ?? '',
    })
    setSkillsText(job.requiredSkills.join(', '))
  }, [job])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        requiredSkills: skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }

      if (isEdit && id) {
        return adminJobsApi.update(id, payload)
      }

      return adminJobsApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      navigate('/jobs')
    },
  })

  const closeMutation = useMutation({
    mutationFn: () => adminJobsApi.close(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      navigate('/jobs')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminJobsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      navigate('/jobs')
    },
  })

  if (isEdit && isLoading) {
    return <p className="text-sm text-muted">Loading job…</p>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div>
        <h2 className="font-heading text-xl font-semibold">
          {isEdit ? 'Edit job' : 'Add job'}
        </h2>
        <p className="text-sm text-muted mt-1">Paste job details manually</p>
      </div>

      <form
        className="space-y-4 rounded-xl border border-border bg-panel p-6"
        onSubmit={(e) => {
          e.preventDefault()
          saveMutation.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company">
            <input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Role">
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Salary">
            <input
              value={form.salary ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
              className={inputClass}
              placeholder="₹25-40 LPA"
            />
          </Field>
        </div>

        <Field label="Apply URL">
          <input
            type="url"
            value={form.applyUrl}
            onChange={(e) => setForm((f) => ({ ...f, applyUrl: e.target.value }))}
            className={inputClass}
            required
          />
        </Field>

        <Field label="Required skills (comma-separated)">
          <input
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            className={inputClass}
            placeholder="Node.js, PostgreSQL, Redis"
          />
        </Field>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isRemote ?? false}
            onChange={(e) => setForm((f) => ({ ...f, isRemote: e.target.checked }))}
          />
          Remote role
        </label>

        <Field label="Description">
          <textarea
            rows={8}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inputClass}
            required
            minLength={20}
          />
        </Field>

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
            {saveMutation.isPending ? 'Saving…' : 'Save job'}
          </button>

          {isEdit && job?.status === 'active' && (
            <button
              type="button"
              onClick={() => closeMutation.mutate()}
              disabled={closeMutation.isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Mark closed
            </button>
          )}

          {isEdit && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Permanently delete this job?')) {
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
