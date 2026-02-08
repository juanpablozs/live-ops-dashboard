import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useEventStore } from '../store/eventStore'

/**
 * Hook for event actions (mark read, acknowledge, resolve)
 */
export function useEventActions() {
  const queryClient = useQueryClient()
  const markAsRead = useEventStore((state) => state.markAsRead)
  const markMultipleAsRead = useEventStore((state) => state.markMultipleAsRead)

  const markReadMutation = useMutation({
    mutationFn: (eventId: string) => api.markEventAsRead(eventId),
    onSuccess: (_, eventId) => {
      markAsRead(eventId)
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const markMultipleReadMutation = useMutation({
    mutationFn: (eventIds: string[]) => api.markEventsAsRead(eventIds),
    onSuccess: (_, eventIds) => {
      markMultipleAsRead(eventIds)
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const acknowledgeMutation = useMutation({
    mutationFn: (eventId: string) => api.acknowledgeIncident(eventId),
    onSuccess: (_, eventId) => {
      useEventStore.getState().updateEvent(eventId, { status: 'acknowledged' })
    },
  })

  const resolveMutation = useMutation({
    mutationFn: (eventId: string) => api.resolveIncident(eventId),
    onSuccess: (_, eventId) => {
      useEventStore.getState().updateEvent(eventId, { status: 'resolved' })
    },
  })

  return {
    markAsRead: markReadMutation.mutate,
    markMultipleAsRead: markMultipleReadMutation.mutate,
    acknowledgeIncident: acknowledgeMutation.mutate,
    resolveIncident: resolveMutation.mutate,
    isLoading:
      markReadMutation.isPending ||
      markMultipleReadMutation.isPending ||
      acknowledgeMutation.isPending ||
      resolveMutation.isPending,
  }
}
