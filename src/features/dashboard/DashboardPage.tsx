import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useEventStore } from '@/features/events/store/eventStore'
import { StatCard } from './components/StatCard'
import { EventChart } from './components/EventChart'

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Get real-time unread count from store
  const unreadCount = useEventStore((state) => state.getUnreadCount())

  if (isLoading || !stats) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-6">Dashboard</h1>
        <p className="text-slate-400">Loading stats...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Events Today"
          value={stats.totalToday}
          icon="📊"
          color="blue"
        />
        <StatCard
          title="Unread Events"
          value={unreadCount}
          icon="📬"
          color="yellow"
        />
        <StatCard
          title="Critical (24h)"
          value={stats.criticalLast24h}
          icon="🚨"
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventChart
          title="Events by Type"
          data={stats.byType}
          colors={{
            deploy: '#3b82f6',
            incident: '#ef4444',
            payment: '#10b981',
            signup: '#8b5cf6',
            security: '#f59e0b',
          }}
        />
        <EventChart
          title="Events by Severity"
          data={stats.bySeverity}
          colors={{
            info: '#3b82f6',
            warning: '#f59e0b',
            critical: '#ef4444',
          }}
        />
      </div>
    </div>
  )
}
