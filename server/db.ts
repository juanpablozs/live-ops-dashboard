import { Event, EventType, Severity, EventStatus } from './types'

// In-memory database
let events: Event[] = []
let eventIdCounter = 1

const EVENT_TYPES: EventType[] = [
  'deploy',
  'incident',
  'payment',
  'signup',
  'security',
]
const SEVERITIES: Severity[] = ['info', 'warning', 'critical']
const SERVICES = [
  'api-gateway',
  'auth-service',
  'payment-service',
  'user-service',
  'notification-service',
  'analytics',
]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateEvent(): Event {
  const type = randomElement(EVENT_TYPES)
  const severity = randomElement(SEVERITIES)
  const service = randomElement(SERVICES)

  const titles: Record<EventType, string[]> = {
    deploy: [
      `Deployment started for ${service}`,
      `Rollback initiated on ${service}`,
      `Production deployment completed`,
    ],
    incident: [
      `High error rate detected on ${service}`,
      `Service ${service} is down`,
      `Database connection pool exhausted`,
      `Memory leak detected`,
    ],
    payment: [
      `Payment processed successfully`,
      `Payment gateway timeout`,
      `Refund initiated`,
      `Chargeback received`,
    ],
    signup: [
      `New user registration`,
      `Email verification completed`,
      `Account created from ${randomElement(['US', 'EU', 'ASIA'])}`,
    ],
    security: [
      `Failed login attempts detected`,
      `Unusual API activity`,
      `SSL certificate expiring soon`,
      `Potential DDoS attack`,
    ],
  }

  const messages: Record<Severity, string[]> = {
    info: [
      'Everything is operating normally',
      'Action completed successfully',
      'Monitoring for any issues',
    ],
    warning: [
      'This requires attention soon',
      'Performance degraded',
      'Resource usage approaching threshold',
    ],
    critical: [
      'Immediate action required',
      'Service unavailable',
      'Data integrity at risk',
    ],
  }

  const event: Event = {
    id: `evt_${eventIdCounter++}`,
    type,
    severity,
    title: randomElement(titles[type]),
    message: randomElement(messages[severity]),
    service,
    createdAt: new Date().toISOString(),
    read: false,
    metadata: {
      version: `v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      region: randomElement(['us-east-1', 'eu-west-1', 'ap-southeast-1']),
    },
  }

  if (type === 'incident') {
    event.status = randomElement(['open', 'acknowledged', 'resolved'])
  }

  return event
}

// Initialize with some events
export function initializeDatabase() {
  events = []
  eventIdCounter = 1

  // Generate 50 initial events
  for (let i = 0; i < 50; i++) {
    const event = generateEvent()
    // Make older events more likely to be read
    if (i < 30) {
      event.read = Math.random() > 0.3
    }
    // Backdate creation times
    const hoursAgo = Math.floor(Math.random() * 24)
    const date = new Date()
    date.setHours(date.getHours() - hoursAgo)
    event.createdAt = date.toISOString()
    events.push(event)
  }

  // Sort by createdAt descending
  events.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// Get paginated events
export function getEvents(page: number = 1, limit: number = 50) {
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedEvents = events.slice(start, end)

  return {
    events: paginatedEvents,
    total: events.length,
    page,
    limit,
    totalPages: Math.ceil(events.length / limit),
  }
}

// Get stats
export function getStats() {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const eventsLast24h = events.filter(
    (e) => new Date(e.createdAt) > last24h
  )

  const byType: Record<string, number> = {}
  const bySeverity: Record<string, number> = {}

  events.forEach((event) => {
    byType[event.type] = (byType[event.type] || 0) + 1
    bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1
  })

  return {
    totalToday: eventsLast24h.length,
    unreadCount: events.filter((e) => !e.read).length,
    criticalLast24h: eventsLast24h.filter((e) => e.severity === 'critical')
      .length,
    byType,
    bySeverity,
  }
}

// Find event by ID
export function findEventById(id: string): Event | undefined {
  return events.find((e) => e.id === id)
}

// Mark event as read
export function markEventAsRead(id: string): boolean {
  const event = findEventById(id)
  if (event) {
    event.read = true
    return true
  }
  return false
}

// Mark multiple events as read
export function markEventsAsRead(ids: string[]): number {
  let count = 0
  ids.forEach((id) => {
    if (markEventAsRead(id)) {
      count++
    }
  })
  return count
}

// Update event status
export function updateEventStatus(id: string, status: EventStatus): boolean {
  const event = findEventById(id)
  if (event && event.type === 'incident') {
    event.status = status
    return true
  }
  return false
}

// Add new event (for streaming)
export function addEvent(event: Event) {
  events.unshift(event)
  
  // Keep only last 1000 events
  if (events.length > 1000) {
    events = events.slice(0, 1000)
  }
}

// Generate and add a random event
export function generateAndAddEvent(): Event {
  const event = generateEvent()
  addEvent(event)
  return event
}
