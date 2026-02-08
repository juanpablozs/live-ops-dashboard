import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEventStore } from '@/features/events/store/eventStore'
import { ConnectionStatus } from '@/features/events/components/ConnectionStatus'
import clsx from 'clsx'

export function Layout() {
  const location = useLocation()
  const unreadCount = useEventStore((state) => state.getUnreadCount())

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/events', label: 'Events', badge: unreadCount },
    { path: '/settings', label: 'Settings' },
  ]

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-100">
              LiveOps Dashboard
            </h1>
            <nav className="flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'relative px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    location.pathname.startsWith(item.path)
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                  )}
                >
                  {item.label}
                  {item.badge ? (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>
          <ConnectionStatus />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
