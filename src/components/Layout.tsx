import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { Clapperboard } from 'lucide-react'
import { NotifBell } from '@/components/notifications/NotifBell'
import { cn } from '@/lib/utils'

const PROJECT_TABS = [
  { to: '', label: 'Guión', end: true },
  { to: 'breakdown', label: 'Desglose' },
  { to: 'shots', label: 'Shot list' },
  { to: 'callsheet', label: 'Call sheet' },
  { to: 'team', label: 'Equipo' },
]

export function Layout() {
  const { projectId } = useParams()

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <Clapperboard className="size-5 text-amber" />
          <span className="font-semibold">Capptor</span>
        </Link>
        {projectId ? (
          <nav className="flex items-center gap-1">
            {PROJECT_TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={`/projects/${projectId}/${tab.to}`}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:text-white',
                    isActive && 'bg-surface-hover text-white',
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
        <NotifBell />
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}
