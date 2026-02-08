/**
 * Create a buffered callback that batches rapid calls
 */
export function createBuffer<T>(
  callback: (items: T[]) => void,
  delay: number = 250
) {
  let buffer: T[] = []
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const flush = () => {
    if (buffer.length > 0) {
      callback([...buffer])
      buffer = []
    }
    timeoutId = null
  }

  const add = (item: T) => {
    buffer.push(item)

    if (timeoutId === null) {
      timeoutId = setTimeout(flush, delay)
    }
  }

  const clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    buffer = []
  }

  return { add, flush, clear }
}
