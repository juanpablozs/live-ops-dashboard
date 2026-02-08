import { useSettingsStore } from './store/settingsStore'
import { eventTypes, severities } from '@/types/event'
import { useEffect } from 'react'

export function SettingsPage() {
  const notifications = useSettingsStore((state) => state.notifications)
  const toggleMuteType = useSettingsStore((state) => state.toggleMuteType)
  const toggleMuteSeverity = useSettingsStore(
    (state) => state.toggleMuteSeverity
  )
  const loadSettings = useSettingsStore((state) => state.loadSettings)
  const updateNotifications = useSettingsStore(
    (state) => state.updateNotifications
  )

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleToggleNotifications = () => {
    updateNotifications({ enabled: !notifications.enabled })
    useSettingsStore.getState().saveSettings()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Settings</h1>

      {/* Notifications */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Notifications
        </h2>

        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={notifications.enabled}
            onChange={handleToggleNotifications}
            className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500"
          />
          <div>
            <span className="text-slate-200 font-medium">
              Enable Notifications
            </span>
            <p className="text-sm text-slate-400">
              Show toast notifications for warning and critical events
            </p>
          </div>
        </label>

        {notifications.enabled && (
          <>
            {/* Mute by Type */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                Mute by Event Type
              </h3>
              <div className="space-y-2">
                {eventTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={notifications.mutedTypes.includes(type)}
                      onChange={() => toggleMuteType(type)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500"
                    />
                    <span className="text-slate-300 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mute by Severity */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                Mute by Severity
              </h3>
              <div className="space-y-2">
                {severities.map((severity) => (
                  <label
                    key={severity}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={notifications.mutedSeverities.includes(severity)}
                      onChange={() => toggleMuteSeverity(severity)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500"
                    />
                    <span className="text-slate-300 capitalize">
                      {severity}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <p className="text-sm text-slate-400">
          💡 Settings are automatically saved to your browser's local storage.
        </p>
      </div>
    </div>
  )
}
