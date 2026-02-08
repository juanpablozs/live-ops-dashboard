import { useEffect, useRef } from 'react'
import { Event } from '@/types/event'
import { useToastStore } from '@/components/Toast/toastStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'

/**
 * Hook to show notifications for critical events
 */
export function useEventNotifications(events: Event[]) {
  const addToast = useToastStore((state) => state.addToast)
  const settings = useSettingsStore((state) => state.notifications)
  const processedEventIds = useRef(new Set<string>())

  useEffect(() => {
    // Load settings on mount
    useSettingsStore.getState().loadSettings()
  }, [])

  useEffect(() => {
    if (!settings.enabled) return

    events.forEach((event) => {
      // Skip if already processed
      if (processedEventIds.current.has(event.id)) return

      // Skip if type is muted
      if (settings.mutedTypes.includes(event.type)) return

      // Skip if severity is muted
      if (settings.mutedSeverities.includes(event.severity)) return

      // Only show notifications for warning and critical
      if (event.severity === 'warning' || event.severity === 'critical') {
        addToast({
          type: event.severity,
          title: event.title,
          message: `${event.service}: ${event.message}`,
          duration: event.severity === 'critical' ? 0 : 7000,
        })

        processedEventIds.current.add(event.id)
      }
    })

    // Clean up old processed IDs (keep only last 1000)
    if (processedEventIds.current.size > 1000) {
      const ids = Array.from(processedEventIds.current)
      processedEventIds.current = new Set(ids.slice(-1000))
    }
  }, [events, settings, addToast])
}
