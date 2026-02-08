import { useMemo } from 'react'

interface EventChartProps {
  title: string
  data: Record<string, number>
  colors: Record<string, string>
}

export function EventChart({ title, data, colors }: EventChartProps) {
  const total = useMemo(
    () => Object.values(data).reduce((sum, val) => sum + val, 0),
    [data]
  )

  const entries = useMemo(
    () =>
      Object.entries(data)
        .map(([key, value]) => ({
          key,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value),
    [data, total]
  )

  const maxValue = useMemo(
    () => Math.max(...Object.values(data), 1),
    [data]
  )

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">{title}</h3>

      {total === 0 ? (
        <p className="text-slate-400 text-center py-8">No data yet</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300 capitalize">
                  {entry.key}
                </span>
                <span className="text-sm text-slate-400">
                  {entry.value} ({entry.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(entry.value / maxValue) * 100}%`,
                    backgroundColor: colors[entry.key] || '#64748b',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total</span>
          <span className="text-slate-300 font-semibold">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
