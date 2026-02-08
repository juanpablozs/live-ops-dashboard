import { describe, it, expect } from 'vitest'
import { deduplicateEvents, boundEventList } from '@/utils/dedup'
import { Event } from '@/types/event'

const createMockEvent = (id: string, createdAt: Date): Event => ({
  id,
  type: 'deploy',
  severity: 'info',
  title: `Event ${id}`,
  message: 'Test message',
  service: 'test-service',
  createdAt: createdAt.toISOString(),
  read: false,
})

describe('deduplicateEvents', () => {
  it('should remove duplicate events by ID', () => {
    const existing: Event[] = [
      createMockEvent('1', new Date('2024-01-01')),
      createMockEvent('2', new Date('2024-01-02')),
    ]

    const newEvents: Event[] = [
      createMockEvent('2', new Date('2024-01-03')), // duplicate
      createMockEvent('3', new Date('2024-01-03')),
    ]

    const result = deduplicateEvents(existing, newEvents)

    expect(result).toHaveLength(3)
    expect(result.map((e) => e.id)).toEqual(
      expect.arrayContaining(['1', '2', '3'])
    )
  })

  it('should keep newer version of duplicate events', () => {
    const oldDate = new Date('2024-01-01')
    const newDate = new Date('2024-01-03')

    const existing: Event[] = [
      { ...createMockEvent('1', oldDate), title: 'Old Title' },
    ]

    const newEvents: Event[] = [
      { ...createMockEvent('1', newDate), title: 'New Title' },
    ]

    const result = deduplicateEvents(existing, newEvents)

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('New Title')
  })

  it('should handle empty arrays', () => {
    expect(deduplicateEvents([], [])).toEqual([])
    
    const existing = [createMockEvent('1', new Date())]
    expect(deduplicateEvents(existing, [])).toHaveLength(1)
    expect(deduplicateEvents([], existing)).toHaveLength(1)
  })
})

describe('boundEventList', () => {
  it('should keep all events if under maxSize', () => {
    const events: Event[] = [
      createMockEvent('1', new Date('2024-01-01')),
      createMockEvent('2', new Date('2024-01-02')),
    ]

    const result = boundEventList(events, 10)
    expect(result).toHaveLength(2)
  })

  it('should trim to maxSize keeping most recent', () => {
    const events: Event[] = [
      createMockEvent('1', new Date('2024-01-01')),
      createMockEvent('2', new Date('2024-01-02')),
      createMockEvent('3', new Date('2024-01-03')),
      createMockEvent('4', new Date('2024-01-04')),
      createMockEvent('5', new Date('2024-01-05')),
    ]

    const result = boundEventList(events, 3)
    
    expect(result).toHaveLength(3)
    expect(result.map((e) => e.id)).toEqual(['5', '4', '3'])
  })

  it('should sort by createdAt descending', () => {
    const events: Event[] = [
      createMockEvent('1', new Date('2024-01-03')),
      createMockEvent('2', new Date('2024-01-01')),
      createMockEvent('3', new Date('2024-01-05')),
    ]

    const result = boundEventList(events, 10)
    
    expect(result.map((e) => e.id)).toEqual(['3', '1', '2'])
  })
})
