import { useEffect, useRef, useCallback } from 'react'
import { useEventStore } from '../store/eventStore'
import { createSSEClient, SSEClient } from '@/lib/sse/createSSEClient'
import { createBuffer } from '@/utils/buffer'
import { Event } from '@/types/event'

/**
 * Hook to manage SSE connection and event streaming
 */
export function useEventStream() {
  const clientRef = useRef<SSEClient | null>(null)
  const bufferRef = useRef<ReturnType<typeof createBuffer<Event>> | null>(null)

  const addEvents = useEventStore((state) => state.addEvents)
  const setConnectionStatus = useEventStore(
    (state) => state.setConnectionStatus
  )
  const isPaused = useEventStore((state) => state.isPaused)

  // Initialize buffer for batching events
  useEffect(() => {
    bufferRef.current = createBuffer<Event>((events) => {
      addEvents(events)
    }, 250) // 250ms batch window

    return () => {
      bufferRef.current?.clear()
    }
  }, [addEvents])

  // Initialize SSE client
  useEffect(() => {
    const client = createSSEClient({
      url: '/stream',
      onMessage: (event) => {
        if (!isPaused) {
          bufferRef.current?.add(event)
        }
      },
      onStatusChange: (status) => {
        setConnectionStatus(status)
      },
      onError: (error) => {
        console.error('SSE client error:', error)
      },
    })

    clientRef.current = client
    client.connect()

    return () => {
      client.disconnect()
      bufferRef.current?.clear()
    }
  }, [setConnectionStatus, isPaused])

  const reconnect = useCallback(() => {
    clientRef.current?.disconnect()
    clientRef.current?.connect()
  }, [])

  return {
    reconnect,
  }
}
