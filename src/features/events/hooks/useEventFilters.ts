import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  EventFilters,
  EventType,
  Severity,
  eventTypes,
  severities,
} from '@/types/event'
import { filtersToSearchParams, searchParamsToFilters } from '@/lib/urlState'

const DEFAULT_FILTERS: EventFilters = {
  types: [],
  severities: [],
  services: [],
  unreadOnly: false,
  search: '',
}

/**
 * Hook to manage event filters with URL sync
 */
export function useEventFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<EventFilters>(() => {
    const urlFilters = searchParamsToFilters(searchParams)
    return { ...DEFAULT_FILTERS, ...urlFilters }
  })

  // Sync filters to URL
  useEffect(() => {
    const params = filtersToSearchParams(filters)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const updateFilters = useCallback((updates: Partial<EventFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const toggleType = useCallback((type: EventType) => {
    setFilters((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type]
      return { ...prev, types }
    })
  }, [])

  const toggleSeverity = useCallback((severity: Severity) => {
    setFilters((prev) => {
      const severities = prev.severities.includes(severity)
        ? prev.severities.filter((s) => s !== severity)
        : [...prev.severities, severity]
      return { ...prev, severities }
    })
  }, [])

  const toggleService = useCallback((service: string) => {
    setFilters((prev) => {
      const services = prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service]
      return { ...prev, services }
    })
  }, [])

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }, [])

  const toggleUnreadOnly = useCallback(() => {
    setFilters((prev) => ({ ...prev, unreadOnly: !prev.unreadOnly }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.severities.length > 0 ||
    filters.services.length > 0 ||
    filters.unreadOnly ||
    filters.search.length > 0

  return {
    filters,
    updateFilters,
    toggleType,
    toggleSeverity,
    toggleService,
    setSearch,
    toggleUnreadOnly,
    clearFilters,
    hasActiveFilters,
  }
}
