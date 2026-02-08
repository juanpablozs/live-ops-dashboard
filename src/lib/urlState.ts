import { EventFilters } from '@/types/event'

/**
 * Sync filters to URL search params
 */
export function filtersToSearchParams(filters: EventFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.types.length > 0) {
    params.set('types', filters.types.join(','))
  }

  if (filters.severities.length > 0) {
    params.set('severities', filters.severities.join(','))
  }

  if (filters.services.length > 0) {
    params.set('services', filters.services.join(','))
  }

  if (filters.unreadOnly) {
    params.set('unread', 'true')
  }

  if (filters.search) {
    params.set('q', filters.search)
  }

  return params
}

/**
 * Parse filters from URL search params
 */
export function searchParamsToFilters(
  params: URLSearchParams
): Partial<EventFilters> {
  const filters: Partial<EventFilters> = {}

  const types = params.get('types')
  if (types) {
    filters.types = types.split(',') as EventFilters['types']
  }

  const severities = params.get('severities')
  if (severities) {
    filters.severities = severities.split(',') as EventFilters['severities']
  }

  const services = params.get('services')
  if (services) {
    filters.services = services.split(',')
  }

  const unread = params.get('unread')
  if (unread === 'true') {
    filters.unreadOnly = true
  }

  const search = params.get('q')
  if (search) {
    filters.search = search
  }

  return filters
}
