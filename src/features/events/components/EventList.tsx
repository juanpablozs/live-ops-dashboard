import { useMemo } from 'react'
import { useEventStore } from '../store/eventStore'
import { useEventFilters } from '../hooks/useEventFilters'
import { EventItem } from './EventItem'
import { Event } from '@/types/event'

export function EventList() {
  const events = useEventStore((state) => state.events)
  const { filters } = useEventFilters()

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false
      }

      // Severity filter
      if (
        filters.severities.length > 0 &&
        !filters.severities.includes(event.severity)
      ) {
        return false
      }

      // Service filter
      if (
        filters.services.length > 0 &&
        !filters.services.includes(event.service)
      ) {
        return false
      }

      // Unread only
      if (filters.unreadOnly && event.read) {
        return false
      }

      // Search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const titleMatch = event.title.toLowerCase().includes(searchLower)
        const messageMatch = event.message.toLowerCase().includes(searchLower)
        const serviceMatch = event.service.toLowerCase().includes(searchLower)
        
        if (!titleMatch && !messageMatch && !serviceMatch) {
          return false
        }
      }

      return true
    })
  }, [events, filters])

  // Sort by createdAt descending (newest first)
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [filteredEvents])

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">
          {events.length === 0
            ? 'No events yet. Waiting for incoming events...'
            : 'No events match the current filters.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedEvents.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  )
}
