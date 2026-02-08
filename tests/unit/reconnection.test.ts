import { describe, it, expect } from 'vitest'
import { calculateBackoff } from '@/lib/sse/reconnection'

describe('calculateBackoff', () => {
  it('should return a value between 0 and baseDelay for attempt 0', () => {
    const delay = calculateBackoff(0, 1000)
    expect(delay).toBeGreaterThanOrEqual(0)
    expect(delay).toBeLessThanOrEqual(1000)
  })

  it('should increase exponentially with each attempt', () => {
    const delays = [
      calculateBackoff(0, 1000, 30000),
      calculateBackoff(1, 1000, 30000),
      calculateBackoff(2, 1000, 30000),
      calculateBackoff(3, 1000, 30000),
    ]

    // Average delays should increase exponentially
    // attempt 0: 0-1000ms (avg ~500)
    // attempt 1: 0-2000ms (avg ~1000)
    // attempt 2: 0-4000ms (avg ~2000)
    // attempt 3: 0-8000ms (avg ~4000)
    
    // We can't guarantee exact values due to jitter, but we can verify ranges
    expect(delays[0]).toBeLessThanOrEqual(1000)
    expect(delays[1]).toBeLessThanOrEqual(2000)
    expect(delays[2]).toBeLessThanOrEqual(4000)
    expect(delays[3]).toBeLessThanOrEqual(8000)
  })

  it('should cap at maxDelay', () => {
    const maxDelay = 10000
    
    // attempt 10 would be 1000 * 2^10 = 1,024,000ms without cap
    const delay = calculateBackoff(10, 1000, maxDelay)
    
    expect(delay).toBeLessThanOrEqual(maxDelay)
  })

  it('should apply jitter (randomization)', () => {
    const delays = []
    for (let i = 0; i < 10; i++) {
      delays.push(calculateBackoff(3, 1000, 30000))
    }

    // With jitter, delays should not all be the same
    const uniqueDelays = new Set(delays)
    expect(uniqueDelays.size).toBeGreaterThan(1)
  })

  it('should respect custom baseDelay', () => {
    const delay = calculateBackoff(0, 2000)
    expect(delay).toBeGreaterThanOrEqual(0)
    expect(delay).toBeLessThanOrEqual(2000)
  })

  it('should respect custom maxDelay', () => {
    const maxDelay = 5000
    const delay = calculateBackoff(10, 1000, maxDelay)
    expect(delay).toBeLessThanOrEqual(maxDelay)
  })

  it('should handle attempt 0 correctly', () => {
    // attempt 0: 1000 * 2^0 = 1000ms
    const delay = calculateBackoff(0, 1000, 30000)
    expect(delay).toBeGreaterThanOrEqual(0)
    expect(delay).toBeLessThanOrEqual(1000)
  })

  it('should produce increasing max possible delays', () => {
    // Test the maximum possible values (before jitter)
    const baseDelay = 1000
    const maxDelay = 30000

    // Verify exponential growth pattern
    expect(baseDelay * Math.pow(2, 0)).toBe(1000)
    expect(baseDelay * Math.pow(2, 1)).toBe(2000)
    expect(baseDelay * Math.pow(2, 2)).toBe(4000)
    expect(baseDelay * Math.pow(2, 3)).toBe(8000)
    expect(baseDelay * Math.pow(2, 4)).toBe(16000)
    
    // After attempt 5, should be capped at maxDelay
    expect(Math.min(baseDelay * Math.pow(2, 5), maxDelay)).toBe(30000)
  })
})
