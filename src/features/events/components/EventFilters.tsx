import { EventType, Severity, eventTypes, severities } from '@/types/event'
import { useEventFilters } from '../hooks/useEventFilters'
import clsx from 'clsx'
import { useState, useMemo } from 'react'

export function EventFilters() {
  const {
    filters,
    toggleType,
    toggleSeverity,
    toggleService,
    setSearch,
    toggleUnreadOnly,
    clearFilters,
    hasActiveFilters,
  } = useEventFilters()

  const [searchInput, setSearchInput] = useState(filters.search)

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    const timeoutId = setTimeout(() => {
      setSearch(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Mock services - in a real app, this would come from the API
  const availableServices = useMemo(
    () => [
      'api-gateway',
      'auth-service',
      'payment-service',
      'user-service',
      'notification-service',
      'analytics',
    ],
    []
  )

  return (
    <div className="bg-slate-800 p-4 rounded-lg space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search events..."
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Unread Only */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.unreadOnly}
          onChange={toggleUnreadOnly}
          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
        />
        <span className="text-sm text-slate-300">Unread only</span>
      </label>

      {/* Type Filter */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">Type</h3>
        <div className="flex flex-wrap gap-2">
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={clsx(
                'px-3 py-1 text-sm rounded-md transition-colors',
                filters.types.includes(type)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Severity Filter */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">Severity</h3>
        <div className="flex flex-wrap gap-2">
          {severities.map((severity) => (
            <button
              key={severity}
              onClick={() => toggleSeverity(severity)}
              className={clsx(
                'px-3 py-1 text-sm rounded-md transition-colors capitalize',
                filters.severities.includes(severity)
                  ? severity === 'critical'
                    ? 'bg-red-600 text-white'
                    : severity === 'warning'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      {/* Service Filter */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">Service</h3>
        <div className="flex flex-wrap gap-2">
          {availableServices.map((service) => (
            <button
              key={service}
              onClick={() => toggleService(service)}
              className={clsx(
                'px-3 py-1 text-sm rounded-md transition-colors',
                filters.services.includes(service)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors text-sm"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )
}
