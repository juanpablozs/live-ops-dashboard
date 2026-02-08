import { Request, Response } from 'express'
import { generateAndAddEvent } from './db'

interface SSEClient {
  id: string
  response: Response
}

const clients: SSEClient[] = []
let clientIdCounter = 1

// Send event to all connected clients
export function broadcastEvent(event: any) {
  const data = JSON.stringify(event)

  clients.forEach((client) => {
    client.response.write(`data: ${data}\n\n`)
  })

  console.log(`📡 Broadcasted event ${event.id} to ${clients.length} clients`)
}

// Handle SSE connection
export function handleSSEConnection(req: Request, res: Response) {
  const clientId = `client_${clientIdCounter++}`

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable buffering for nginx

  // Add client to list
  const client: SSEClient = { id: clientId, response: res }
  clients.push(client)

  console.log(`✅ Client ${clientId} connected. Total clients: ${clients.length}`)

  // Send initial connection event
  res.write(
    `data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`
  )

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(`: heartbeat\n\n`)
  }, 30000)

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval)
    const index = clients.findIndex((c) => c.id === clientId)
    if (index !== -1) {
      clients.splice(index, 1)
    }
    console.log(`❌ Client ${clientId} disconnected. Total clients: ${clients.length}`)
  })
}

// Start event generator
export function startEventGenerator() {
  // Generate events at random intervals (2-8 seconds)
  function scheduleNextEvent() {
    const delay = 2000 + Math.random() * 6000 // 2-8 seconds
    setTimeout(() => {
      const event = generateAndAddEvent()
      broadcastEvent(event)
      scheduleNextEvent()
    }, delay)
  }

  scheduleNextEvent()
  console.log('🎲 Event generator started')
}

// Occasionally generate burst events for testing
export function startBurstGenerator() {
  setInterval(() => {
    // 10% chance of burst
    if (Math.random() < 0.1) {
      const burstSize = 3 + Math.floor(Math.random() * 5) // 3-7 events
      console.log(`💥 Generating burst of ${burstSize} events`)
      
      for (let i = 0; i < burstSize; i++) {
        setTimeout(() => {
          const event = generateAndAddEvent()
          broadcastEvent(event)
        }, i * 200) // 200ms apart
      }
    }
  }, 30000) // Check every 30 seconds
}
