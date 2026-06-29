import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { adminFetch } from '@/api/client'
import { setAdminKey } from '@/lib/adminKey'

export default function LoginPage() {
  const navigate = useNavigate()
  const [key, setKey] = useState(import.meta.env.VITE_ADMIN_API_KEY ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      setAdminKey(key.trim())
      await adminFetch('/admin/jobs?limit=1')
      navigate('/jobs')
    } catch (err) {
      setAdminKey('')
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-border bg-panel p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-panel-secondary border border-border">
            <KeyRound className="h-5 w-5 text-cyan" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold">Admin sign in</h1>
            <p className="text-sm text-muted">Enter your admin API key</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-1.5 block">Admin API key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full rounded-lg border border-border bg-panel-secondary px-3 py-2 text-sm outline-none focus:border-cyan/50"
            placeholder="ADMIN_API_KEY"
            required
          />
        </div>

        {error && <p className="text-sm text-red">{error}</p>}

        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="w-full rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
