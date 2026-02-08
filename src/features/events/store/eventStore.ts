import { create } from 'zustand'
import { Event, ConnectionStatus } from '@/types/event'
import { deduplicateEvents, boundEventList } from '@/utils/dedup'

const MAX_EVENTS = 500

interface EventStore {
  events: Event[]
  connectionStatus: ConnectionStatus
  isPaused: boolean
  
  // Actions
  addEvents: (newEvents: Event[]) => void
  updateEvent: (eventId: string, updates: Partial<Event>) => void
  clearEvents: () => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setPaused: (paused: boolean) => void
  markAsRead: (eventId: string) => void
  markMultipleAsRead: (eventIds: string[]) => void
  getUnreadCount: () => number
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  connectionStatus: 'disconnected',
  isPaused: false,

  addEvents: (newEvents) =>
    set((state) => {
      if (state.isPaused) {
        return state // Don't add events when paused
      }
      
      const deduplicated = deduplicateEvents(state.events, newEvents)
      const bounded = boundEventList(deduplicated, MAX_EVENTS)
      
      return { events: bounded }
    }),

  updateEvent: (eventId, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
    })),

  clearEvents: () => set({ events: [] }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setPaused: (paused) => set({ isPaused: paused }),

  markAsRead: (eventId) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, read: true } : event
      ),
    })),

  markMultipleAsRead: (eventIds) =>
    set((state) => {
      const idSet = new Set(eventIds)
      return {
        events: state.events.map((event) =>
          idSet.has(event.id) ? { ...event, read: true } : event
        ),
      }
    }),

  getUnreadCount: () => {
    const state = get()
    return state.events.filter((e) => !e.read).length
  },
}))
