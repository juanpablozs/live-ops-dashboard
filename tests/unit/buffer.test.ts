import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBuffer } from '@/utils/buffer'

describe('createBuffer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should batch multiple items within delay window', () => {
    const callback = vi.fn()
    const buffer = createBuffer(callback, 250)

    buffer.add('item1')
    buffer.add('item2')
    buffer.add('item3')

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled()

    // Fast-forward time
    vi.advanceTimersByTime(250)

    // Now callback should be called with all items
    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith(['item1', 'item2', 'item3'])
  })

  it('should call callback after delay', () => {
    const callback = vi.fn()
    const buffer = createBuffer(callback, 100)

    buffer.add('item1')

    vi.advanceTimersByTime(99)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('should clear buffer after flush', () => {
    const callback = vi.fn()
    const buffer = createBuffer(callback, 250)

    buffer.add('item1')
    vi.advanceTimersByTime(250)
    
    expect(callback).toHaveBeenCalledWith(['item1'])

    // Add more items
    callback.mockClear()
    buffer.add('item2')
    vi.advanceTimersByTime(250)

    // Should only contain new items
    expect(callback).toHaveBeenCalledWith(['item2'])
  })

  it('should support manual flush', () => {
    const callback = vi.fn()
    const buffer = createBuffer(callback, 1000)

    buffer.add('item1')
    buffer.flush()

    expect(callback).toHaveBeenCalledWith(['item1'])
  })

  it('should support clear without calling callback', () => {
    const callback = vi.fn()
    const buffer = createBuffer(callback, 250)

    buffer.add('item1')
    buffer.clear()

    vi.advanceTimersByTime(250)
    expect(callback).not.toHaveBeenCalled()
  })
})
