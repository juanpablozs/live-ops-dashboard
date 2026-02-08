import { describe, it, expect } from 'vitest'
import {
  filtersToSearchParams,
  searchParamsToFilters,
} from '@/lib/urlState'
import { EventFilters } from '@/types/event'

describe('urlState', () => {
  describe('filtersToSearchParams', () => {
    it('should convert types filter to URL params', () => {
      const filters: EventFilters = {
        types: ['deploy', 'incident'],
        severities: [],
        services: [],
        unreadOnly: false,
        search: '',
      }

      const params = filtersToSearchParams(filters)
      expect(params.get('types')).toBe('deploy,incident')
    })

    it('should convert severities filter to URL params', () => {
      const filters: EventFilters = {
        types: [],
        severities: ['critical', 'warning'],
        services: [],
        unreadOnly: false,
        search: '',
      }

      const params = filtersToSearchParams(filters)
      expect(params.get('severities')).toBe('critical,warning')
    })

    it('should convert unreadOnly to URL params', () => {
      const filters: EventFilters = {
        types: [],
        severities: [],
        services: [],
        unreadOnly: true,
        search: '',
      }

      const params = filtersToSearchParams(filters)
      expect(params.get('unread')).toBe('true')
    })

    it('should convert search to URL params', () => {
      const filters: EventFilters = {
        types: [],
        severities: [],
        services: [],
        unreadOnly: false,
        search: 'test query',
      }

      const params = filtersToSearchParams(filters)
      expect(params.get('q')).toBe('test query')
    })

    it('should handle empty filters', () => {
      const filters: EventFilters = {
        types: [],
        severities: [],
        services: [],
        unreadOnly: false,
        search: '',
      }

      const params = filtersToSearchParams(filters)
      expect(params.toString()).toBe('')
    })
  })

  describe('searchParamsToFilters', () => {
    it('should parse types from URL params', () => {
      const params = new URLSearchParams('types=deploy,incident')
      const filters = searchParamsToFilters(params)

      expect(filters.types).toEqual(['deploy', 'incident'])
    })

    it('should parse severities from URL params', () => {
      const params = new URLSearchParams('severities=critical,warning')
      const filters = searchParamsToFilters(params)

      expect(filters.severities).toEqual(['critical', 'warning'])
    })

    it('should parse unreadOnly from URL params', () => {
      const params = new URLSearchParams('unread=true')
      const filters = searchParamsToFilters(params)

      expect(filters.unreadOnly).toBe(true)
    })

    it('should parse search from URL params', () => {
      const params = new URLSearchParams('q=test+query')
      const filters = searchParamsToFilters(params)

      expect(filters.search).toBe('test query')
    })

    it('should handle empty params', () => {
      const params = new URLSearchParams('')
      const filters = searchParamsToFilters(params)

      expect(filters).toEqual({})
    })

    it('should roundtrip filters', () => {
      const original: EventFilters = {
        types: ['deploy'],
        severities: ['critical'],
        services: ['api-gateway'],
        unreadOnly: true,
        search: 'error',
      }

      const params = filtersToSearchParams(original)
      const parsed = searchParamsToFilters(params)

      expect(parsed.types).toEqual(original.types)
      expect(parsed.severities).toEqual(original.severities)
      expect(parsed.services).toEqual(original.services)
      expect(parsed.unreadOnly).toBe(original.unreadOnly)
      expect(parsed.search).toBe(original.search)
    })
  })
})
