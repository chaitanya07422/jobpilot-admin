import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Briefcase, LogOut } from 'lucide-react'
import { clearAdminKey, isAdminAuthenticated } from '@/lib/adminKey'

const navItems = [
  { to: '/jobs', label: 'Jobs' },
  { to: '/sources', label: 'Sources' },
]

export function AdminLayout() {
  const navigate = useNavigate()

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan" />
              <div>
                <p className="font-heading font-semibold">JobPilot Admin</p>
                <p className="text-xs text-muted">Job catalog management</p>
              </div>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm ${
                      isActive
                        ? 'bg-cyan/15 text-cyan'
                        : 'text-muted hover:text-foreground'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <button
            type="button"
            onClick={() => {
              clearAdminKey()
              navigate('/login')
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
