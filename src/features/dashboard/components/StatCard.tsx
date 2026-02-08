interface StatCardProps {
  title: string
  value: number
  icon: string
  color: 'blue' | 'yellow' | 'red' | 'green'
}

const colorClasses = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
  green: 'bg-green-500/10 border-green-500/20 text-green-400',
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}
