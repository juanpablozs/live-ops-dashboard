import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEventStore } from './store/eventStore'
import { useEventActions } from './hooks/useEventActions'
import clsx from 'clsx'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const event = useEventStore((state) =>
    state.events.find((e) => e.id === id)
  )
  const { markAsRead, acknowledgeIncident, resolveIncident } = useEventActions()

  if (!event) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/events')}
            className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            ← Back to Events
          </button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-slate-100 mb-2">
              Event Not Found
            </h1>
            <p className="text-slate-400">
              The event you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const severityColors = {
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  const handleMarkAsRead = () => {
    if (!event.read) {
      markAsRead(event.id)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/events')}
          className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-2"
        >
          ← Back to Events
        </button>

        {/* Event Header */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-100">
                  {event.title}
                </h1>
                {!event.read && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span
                  className={clsx(
                    'px-3 py-1 rounded-md font-medium uppercase border',
                    severityColors[event.severity]
                  )}
                >
                  {event.severity}
                </span>
                <span className="px-3 py-1 bg-slate-700 rounded-md capitalize">
                  {event.type}
                </span>
                {event.status && (
                  <span className="px-3 py-1 bg-slate-700 rounded-md capitalize">
                    {event.status}
                  </span>
                )}
              </div>
            </div>
            {!event.read && (
              <button
                onClick={handleMarkAsRead}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Mark as Read
              </button>
            )}
          </div>

          <p className="text-slate-300 mb-4">{event.message}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Service:</span>
              <span className="ml-2 text-slate-300">{event.service}</span>
            </div>
            <div>
              <span className="text-slate-500">Event ID:</span>
              <span className="ml-2 text-slate-300 font-mono">{event.id}</span>
            </div>
            <div>
              <span className="text-slate-500">Created:</span>
              <span className="ml-2 text-slate-300">
                {new Date(event.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Read:</span>
              <span className="ml-2 text-slate-300">
                {event.read ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions (for incidents) */}
        {event.type === 'incident' && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              Actions
            </h2>
            <div className="flex gap-3">
              {event.status !== 'acknowledged' && event.status !== 'resolved' && (
                <button
                  onClick={() => acknowledgeIncident(event.id)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                >
                  Acknowledge
                </button>
              )}
              {event.status !== 'resolved' && (
                <button
                  onClick={() => resolveIncident(event.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Metadata
          </h2>
          <pre className="bg-slate-900 p-4 rounded-md overflow-x-auto text-sm text-slate-300">
            {JSON.stringify(event.metadata || {}, null, 2)}
          </pre>
        </div>

        {/* Full Event JSON */}
        <div className="bg-slate-800 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            Full Event Data
          </h2>
          <pre className="bg-slate-900 p-4 rounded-md overflow-x-auto text-sm text-slate-300">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
