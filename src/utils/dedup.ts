import { Event } from '@/types/event'

/**
 * Deduplicate events by ID
 * Keeps the most recent version of each event
 */
export function deduplicateEvents(
  existing: Event[],
  newEvents: Event[]
): Event[] {
  const eventMap = new Map<string, Event>()

  // Add existing events
  existing.forEach((event) => {
    eventMap.set(event.id, event)
  })

  // Override with new events (they're more recent)
  newEvents.forEach((event) => {
    eventMap.set(event.id, event)
  })

  return Array.from(eventMap.values())
}

/**
 * Keep only the N most recent events
 */
export function boundEventList(events: Event[], maxSize: number): Event[] {
  if (events.length <= maxSize) {
    return events
  }

  // Sort by createdAt descending and take the first maxSize
  return events
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    .slice(0, maxSize)
}
