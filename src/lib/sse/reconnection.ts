/**
 * Calculate exponential backoff delay with jitter
 * @param attempt - Current retry attempt (0-indexed)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @param maxDelay - Maximum delay in milliseconds (default: 30000)
 * @returns Delay in milliseconds
 */
export function calculateBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt)

  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay)

  // Add jitter: random value between 0 and cappedDelay
  const jitter = Math.random() * cappedDelay

  return Math.floor(jitter)
}

/**
 * Create a reconnection manager with exponential backoff
 */
export function createReconnectionManager(config: {
  onReconnect: () => void
  onStatusChange: (status: 'reconnecting' | 'offline') => void
  maxAttempts?: number
}) {
  let attempt = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let isReconnecting = false

  const scheduleReconnect = () => {
    if (isReconnecting) return

    // Check if offline
    if (!navigator.onLine) {
      config.onStatusChange('offline')
      return
    }

    isReconnecting = true
    config.onStatusChange('reconnecting')

    const delay = calculateBackoff(attempt)
    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${attempt + 1})`
    )

    timeoutId = setTimeout(() => {
      attempt++
      config.onReconnect()
      isReconnecting = false
    }, delay)
  }

  const reset = () => {
    attempt = 0
    isReconnecting = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const cancel = () => {
    reset()
  }

  return {
    scheduleReconnect,
    reset,
    cancel,
  }
}
