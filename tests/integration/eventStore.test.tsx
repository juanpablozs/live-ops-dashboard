import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEventStore } from '@/features/events/store/eventStore'
import { Event } from '@/types/event'

const createMockEvent = (id: string, overrides?: Partial<Event>): Event => ({
  id,
  type: 'deploy',
  severity: 'info',
  title: `Event ${id}`,
  message: 'Test message',
  service: 'test-service',
  createdAt: new Date().toISOString(),
  read: false,
  ...overrides,
})

describe('eventStore', () => {
  beforeEach(() => {
    useEventStore.setState({
      events: [],
      connectionStatus: 'disconnected',
      isPaused: false,
    })
  })

  it('should add events', () => {
    const { result } = renderHook(() => useEventStore())
    const events = [createMockEvent('1'), createMockEvent('2')]

    act(() => {
      result.current.addEvents(events)
    })

    expect(result.current.events).toHaveLength(2)
  })

  it('should not add events when paused', () => {
    const { result } = renderHook(() => useEventStore())

    act(() => {
      result.current.setPaused(true)
    })

    const events = [createMockEvent('1')]

    act(() => {
      result.current.addEvents(events)
    })

    expect(result.current.events).toHaveLength(0)
  })

  it('should mark event as read', () => {
    const { result } = renderHook(() => useEventStore())
    const event = createMockEvent('1', { read: false })

    act(() => {
      result.current.addEvents([event])
    })

    expect(result.current.events[0].read).toBe(false)

    act(() => {
      result.current.markAsRead('1')
    })

    expect(result.current.events[0].read).toBe(true)
  })

  it('should mark multiple events as read', () => {
    const { result } = renderHook(() => useEventStore())
    const events = [
      createMockEvent('1', { read: false }),
      createMockEvent('2', { read: false }),
      createMockEvent('3', { read: false }),
    ]

    act(() => {
      result.current.addEvents(events)
    })

    act(() => {
      result.current.markMultipleAsRead(['1', '3'])
    })

    expect(result.current.events[0].read).toBe(true)
    expect(result.current.events[1].read).toBe(false)
    expect(result.current.events[2].read).toBe(true)
  })

  it('should calculate unread count', () => {
    const { result } = renderHook(() => useEventStore())
    const events = [
      createMockEvent('1', { read: false }),
      createMockEvent('2', { read: true }),
      createMockEvent('3', { read: false }),
    ]

    act(() => {
      result.current.addEvents(events)
    })

    expect(result.current.getUnreadCount()).toBe(2)
  })

  it('should update event', () => {
    const { result } = renderHook(() => useEventStore())
    const event = createMockEvent('1', { status: 'open' })

    act(() => {
      result.current.addEvents([event])
    })

    act(() => {
      result.current.updateEvent('1', { status: 'resolved' })
    })

    expect(result.current.events[0].status).toBe('resolved')
  })

  it('should update connection status', () => {
    const { result } = renderHook(() => useEventStore())

    expect(result.current.connectionStatus).toBe('disconnected')

    act(() => {
      result.current.setConnectionStatus('connected')
    })

    expect(result.current.connectionStatus).toBe('connected')
  })

  it('should clear all events', () => {
    const { result } = renderHook(() => useEventStore())
    const events = [createMockEvent('1'), createMockEvent('2')]

    act(() => {
      result.current.addEvents(events)
    })

    expect(result.current.events).toHaveLength(2)

    act(() => {
      result.current.clearEvents()
    })

    expect(result.current.events).toHaveLength(0)
  })
})
