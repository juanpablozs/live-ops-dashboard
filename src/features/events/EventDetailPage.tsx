import { useParams } from 'react-router-dom'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">
        Event Detail: {id}
      </h1>
      <p className="text-slate-400">Event detail implementation coming soon...</p>
    </div>
  )
}
