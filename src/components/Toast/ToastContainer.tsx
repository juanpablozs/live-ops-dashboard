import { useToastStore, Toast as ToastType } from './toastStore'
import clsx from 'clsx'

interface ToastProps {
  toast: ToastType
}

const typeStyles = {
  info: {
    bg: 'bg-blue-500/90',
    icon: 'ℹ️',
  },
  warning: {
    bg: 'bg-yellow-500/90',
    icon: '⚠️',
  },
  critical: {
    bg: 'bg-red-500/90',
    icon: '🚨',
  },
  success: {
    bg: 'bg-green-500/90',
    icon: '✅',
  },
}

function Toast({ toast }: ToastProps) {
  const removeToast = useToastStore((state) => state.removeToast)
  const styles = typeStyles[toast.type]

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg text-white min-w-[300px] max-w-md',
        styles.bg
      )}
    >
      <span className="text-2xl flex-shrink-0">{styles.icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-1">{toast.title}</h3>
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            removeToast(toast.id)
          }
        }}
        className="flex-shrink-0 text-white/80 hover:text-white text-xl leading-none"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
