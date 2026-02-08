import express from 'express'
import cors from 'cors'
import {
  initializeDatabase,
  getEvents,
  getStats,
  findEventById,
  markEventAsRead,
  markEventsAsRead,
  updateEventStatus,
} from './db'
import {
  handleSSEConnection,
  startEventGenerator,
  startBurstGenerator,
} from './stream'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Initialize database
initializeDatabase()

// REST API Routes

// Get paginated events
app.get('/api/events', (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 50

  const result = getEvents(page, limit)
  res.json(result)
})

// Get stats
app.get('/api/stats', (req, res) => {
  const stats = getStats()
  res.json(stats)
})

// Get single event
app.get('/api/events/:id', (req, res) => {
  const event = findEventById(req.params.id)
  if (event) {
    res.json(event)
  } else {
    res.status(404).json({ error: 'Event not found' })
  }
})

// Mark event as read
app.post('/api/events/:id/read', (req, res) => {
  const success = markEventAsRead(req.params.id)
  if (success) {
    res.json({ success: true })
  } else {
    res.status(404).json({ error: 'Event not found' })
  }
})

// Mark multiple events as read
app.post('/api/events/read', (req, res) => {
  const { eventIds } = req.body

  if (!Array.isArray(eventIds)) {
    return res.status(400).json({ error: 'eventIds must be an array' })
  }

  const count = markEventsAsRead(eventIds)
  res.json({ success: true, count })
})

// Acknowledge incident
app.post('/api/events/:id/acknowledge', (req, res) => {
  const success = updateEventStatus(req.params.id, 'acknowledged')
  if (success) {
    res.json({ success: true })
  } else {
    res.status(404).json({ error: 'Event not found or not an incident' })
  }
})

// Resolve incident
app.post('/api/events/:id/resolve', (req, res) => {
  const success = updateEventStatus(req.params.id, 'resolved')
  if (success) {
    res.json({ success: true })
  } else {
    res.status(404).json({ error: 'Event not found or not an incident' })
  }
})

// SSE Stream Route
app.get('/stream', handleSSEConnection)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 LiveOps Server running on http://localhost:${PORT}`)
  console.log(`📡 SSE stream available at http://localhost:${PORT}/stream`)
  console.log(`🔌 API endpoints at http://localhost:${PORT}/api/*\n`)

  // Start event generators
  startEventGenerator()
  startBurstGenerator()
})
