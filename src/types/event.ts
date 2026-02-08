import { z } from 'zod'

// Event type and severity enums
export const eventTypes = [
  'deploy',
  'incident',
  'payment',
  'signup',
  'security',
] as const
export const severities = ['info', 'warning', 'critical'] as const
export const statuses = ['open', 'resolved', 'acknowledged'] as const

// Zod schemas for validation
export const EventSchema = z.object({
  id: z.string(),
  type: z.enum(eventTypes),
  severity: z.enum(severities),
  title: z.string(),
  message: z.string(),
  service: z.string(),
  createdAt: z.string(),
  status: z.enum(statuses).optional(),
  metadata: z.record(z.union([z.string(), z.number()])).optional(),
  read: z.boolean(),
})

export const StatsSchema = z.object({
  totalToday: z.number(),
  unreadCount: z.number(),
  criticalLast24h: z.number(),
  byType: z.record(z.number()),
  bySeverity: z.record(z.number()),
})

// TypeScript types
export type Event = z.infer<typeof EventSchema>
export type EventType = (typeof eventTypes)[number]
export type Severity = (typeof severities)[number]
export type EventStatus = (typeof statuses)[number]
export type Stats = z.infer<typeof StatsSchema>

// Filter types
export interface EventFilters {
  types: EventType[]
  severities: Severity[]
  services: string[]
  unreadOnly: boolean
  search: string
}

// SSE Client types
export interface SSEClientConfig {
  url: string
  onMessage: (event: Event) => void
  onStatusChange: (status: ConnectionStatus) => void
  onError?: (error: Error) => void
}

export type ConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'reconnecting'
  | 'disconnected'
  | 'offline'
