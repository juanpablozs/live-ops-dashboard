import { useEventStore } from '../store/eventStore'

export function ConnectionStatus() {
  const status = useEventStore((state) => state.connectionStatus)

  const statusConfig = {
    connected: { color: 'bg-green-500', text: 'Connected' },
    connecting: { color: 'bg-yellow-500', text: 'Connecting...' },
    reconnecting: { color: 'bg-yellow-500', text: 'Reconnecting...' },
    disconnected: { color: 'bg-red-500', text: 'Disconnected' },
    offline: { color: 'bg-gray-500', text: 'Offline' },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span>{config.text}</span>
    </div>
  )
}
