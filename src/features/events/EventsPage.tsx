import { useEventStream } from './hooks/useEventStream'
import { useEventStore } from './store/eventStore'
import { useEventActions } from './hooks/useEventActions'
import { useEventFilters } from './hooks/useEventFilters'
import { useEventNotifications } from './hooks/useEventNotifications'
import { EventList } from './components/EventList'
import { EventFilters } from './components/EventFilters'
import { useMemo } from 'react'

export function EventsPage() {
  useEventStream() // Connect to SSE

  const events = useEventStore((state) => state.events)
  const isPaused = useEventStore((state) => state.isPaused)
  const setPaused = useEventStore((state) => state.setPaused)
  const { markMultipleAsRead } = useEventActions()
  const { filters } = useEventFilters()

  // Show notifications for critical events
  useEventNotifications(events)

  // Get visible event IDs for "Mark all as read"
  const visibleUnreadEventIds = useMemo(() => {
    return events
      .filter((event) => {
        if (event.read) return false

        // Apply same filters as EventList
        if (filters.types.length > 0 && !filters.types.includes(event.type)) {
          return false
        }
        if (
          filters.severities.length > 0 &&
          !filters.severities.includes(event.severity)
        ) {
          return false
        }
        if (
          filters.services.length > 0 &&
          !filters.services.includes(event.service)
        ) {
          return false
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          const matches =
            event.title.toLowerCase().includes(searchLower) ||
            event.message.toLowerCase().includes(searchLower) ||
            event.service.toLowerCase().includes(searchLower)
          if (!matches) return false
        }

        return true
      })
      .map((e) => e.id)
  }, [events, filters])

  const handleMarkAllAsRead = () => {
    if (visibleUnreadEventIds.length > 0) {
      markMultipleAsRead(visibleUnreadEventIds)
    }
  }

  return (
    <div className="h-full flex">
      {/* Sidebar - Filters */}
      <div className="w-80 border-r border-slate-700 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Filters</h2>
        <EventFilters />
      </div>

      {/* Main - Event List */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Live Events</h1>
              <p className="text-sm text-slate-400 mt-1">
                {events.length} events in memory
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPaused(!isPaused)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isPaused
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
              {visibleUnreadEventIds.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md font-medium transition-colors"
                >
                  Mark all as read ({visibleUnreadEventIds.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-6">
          <EventList />
        </div>
      </div>
    </div>
  )
}
