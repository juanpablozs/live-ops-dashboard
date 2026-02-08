import { Event, Severity, EventType } from '@/types/event'
import { useEventActions } from '../hooks/useEventActions'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

interface EventItemProps {
  event: Event
}

const severityColors: Record<Severity, { bg: string; text: string; border: string }> = {
  info: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  warning: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
}

const typeIcons: Record<EventType, string> = {
  deploy: '🚀',
  incident: '🚨',
  payment: '💳',
  signup: '👤',
  security: '🔒',
}

export function EventItem({ event }: EventItemProps) {
  const { markAsRead } = useEventActions()
  const navigate = useNavigate()
  const colors = severityColors[event.severity]

  const handleClick = () => {
    if (!event.read) {
      markAsRead(event.id)
    }
    navigate(`/events/${event.id}`)
  }

  return (
    <div
      className={clsx(
        'p-4 rounded-lg border transition-all cursor-pointer',
        colors.bg,
        colors.border,
        event.read ? 'opacity-60' : 'opacity-100 hover:opacity-80'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl mt-0.5">{typeIcons[event.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-100 truncate">
                {event.title}
              </h3>
              {!event.read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-slate-400 mb-2">{event.message}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className={clsx('font-medium uppercase', colors.text)}>
                {event.severity}
              </span>
              <span>•</span>
              <span>{event.service}</span>
              <span>•</span>
              <span>{new Date(event.createdAt).toLocaleString()}</span>
              {event.status && (
                <>
                  <span>•</span>
                  <span className="capitalize">{event.status}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
