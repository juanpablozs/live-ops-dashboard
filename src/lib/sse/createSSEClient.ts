import { Event, ConnectionStatus, SSEClientConfig } from '@/types/event'
import { EventSchema } from '@/types/event'
import { createReconnectionManager } from './reconnection'

export interface SSEClient {
  connect: () => void
  disconnect: () => void
  getStatus: () => ConnectionStatus
}

/**
 * Create a resilient SSE client with automatic reconnection
 */
export function createSSEClient(config: SSEClientConfig): SSEClient {
  let eventSource: EventSource | null = null
  let status: ConnectionStatus = 'disconnected'
  let isManualDisconnect = false

  const reconnectionManager = createReconnectionManager({
    onReconnect: () => connect(),
    onStatusChange: (newStatus) => {
      status = newStatus
      config.onStatusChange(newStatus)
    },
  })

  const updateStatus = (newStatus: ConnectionStatus) => {
    if (status !== newStatus) {
      status = newStatus
      config.onStatusChange(newStatus)
    }
  }

  const handleOnline = () => {
    console.log('🌐 Network online')
    if (!isManualDisconnect && status === 'offline') {
      reconnectionManager.scheduleReconnect()
    }
  }

  const handleOffline = () => {
    console.log('📴 Network offline')
    updateStatus('offline')
    reconnectionManager.cancel()
  }

  const connect = () => {
    // Close existing connection
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }

    // Check if offline
    if (!navigator.onLine) {
      updateStatus('offline')
      return
    }

    updateStatus('connecting')
    isManualDisconnect = false

    try {
      eventSource = new EventSource(config.url)

      eventSource.onopen = () => {
        console.log('✅ SSE connected')
        updateStatus('connected')
        reconnectionManager.reset()
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Skip connection events
          if (data.type === 'connected') {
            return
          }

          // Validate and parse event
          const parsedEvent = EventSchema.parse(data)
          config.onMessage(parsedEvent)
        } catch (error) {
          console.error('Failed to parse event:', error)
          config.onError?.(error as Error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('❌ SSE error:', error)

        if (eventSource?.readyState === EventSource.CLOSED) {
          eventSource.close()
          eventSource = null

          if (!isManualDisconnect) {
            updateStatus('disconnected')
            reconnectionManager.scheduleReconnect()
          }
        }
      }
    } catch (error) {
      console.error('Failed to create EventSource:', error)
      config.onError?.(error as Error)
      updateStatus('disconnected')
      if (!isManualDisconnect) {
        reconnectionManager.scheduleReconnect()
      }
    }
  }

  const disconnect = () => {
    console.log('🔌 Manual disconnect')
    isManualDisconnect = true
    reconnectionManager.cancel()

    if (eventSource) {
      eventSource.close()
      eventSource = null
    }

    updateStatus('disconnected')
  }

  const getStatus = (): ConnectionStatus => status

  // Listen for online/offline events
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return {
    connect,
    disconnect,
    getStatus,
  }
}
