import { Event, EventSchema, Stats, StatsSchema } from '@/types/event'

const API_BASE = '/api'

export const api = {
  // Fetch paginated events
  async getEvents(params?: {
    page?: number
    limit?: number
  }): Promise<{ events: Event[]; total: number }> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    const response = await fetch(`${API_BASE}/events?${query}`)
    if (!response.ok) {
      throw new Error('Failed to fetch events')
    }
    const data = await response.json()
    
    // Validate with Zod
    const events = data.events.map((e: unknown) => EventSchema.parse(e))
    
    return { events, total: data.total }
  },

  // Fetch stats
  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE}/stats`)
    if (!response.ok) {
      throw new Error('Failed to fetch stats')
    }
    const data = await response.json()
    return StatsSchema.parse(data)
  },

  // Mark event as read
  async markEventAsRead(eventId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/events/${eventId}/read`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to mark event as read')
    }
  },

  // Mark multiple events as read
  async markEventsAsRead(eventIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE}/events/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventIds }),
    })
    if (!response.ok) {
      throw new Error('Failed to mark events as read')
    }
  },

  // Acknowledge incident
  async acknowledgeIncident(eventId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/events/${eventId}/acknowledge`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to acknowledge incident')
    }
  },

  // Resolve incident
  async resolveIncident(eventId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/events/${eventId}/resolve`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to resolve incident')
    }
  },
}
