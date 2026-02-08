import { create } from 'zustand'

interface Settings {
  notifications: {
    enabled: boolean
    mutedTypes: string[]
    mutedSeverities: string[]
  }
}

interface SettingsStore extends Settings {
  updateNotifications: (
    updates: Partial<Settings['notifications']>
  ) => void
  toggleMuteType: (type: string) => void
  toggleMuteSeverity: (severity: string) => void
  loadSettings: () => void
  saveSettings: () => void
}

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    enabled: true,
    mutedTypes: [],
    mutedSeverities: [],
  },
}

const STORAGE_KEY = 'liveops-settings'

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,

  updateNotifications: (updates) =>
    set((state) => ({
      notifications: { ...state.notifications, ...updates },
    })),

  toggleMuteType: (type) =>
    set((state) => {
      const mutedTypes = state.notifications.mutedTypes.includes(type)
        ? state.notifications.mutedTypes.filter((t) => t !== type)
        : [...state.notifications.mutedTypes, type]

      const newState = {
        notifications: { ...state.notifications, mutedTypes },
      }
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      
      return newState
    }),

  toggleMuteSeverity: (severity) =>
    set((state) => {
      const mutedSeverities = state.notifications.mutedSeverities.includes(
        severity
      )
        ? state.notifications.mutedSeverities.filter((s) => s !== severity)
        : [...state.notifications.mutedSeverities, severity]

      const newState = {
        notifications: { ...state.notifications, mutedSeverities },
      }
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      
      return newState
    }),

  loadSettings: () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const settings = JSON.parse(stored)
        set(settings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  },

  saveSettings: () => {
    const state = get()
    const settings: Settings = {
      notifications: state.notifications,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  },
}))
