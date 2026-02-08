export type EventType = 'deploy' | 'incident' | 'payment' | 'signup' | 'security'
export type Severity = 'info' | 'warning' | 'critical'
export type EventStatus = 'open' | 'resolved' | 'acknowledged'

export interface Event {
  id: string
  type: EventType
  severity: Severity
  title: string
  message: string
  service: string
  createdAt: string
  status?: EventStatus
  metadata?: Record<string, string | number>
  read: boolean
}
