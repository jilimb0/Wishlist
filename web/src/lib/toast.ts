type ToastVariant = "default" | "success" | "warning" | "error" | "info"

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

type ToastListener = (toasts: ToastItem[]) => void

let toasts: ToastItem[] = []
const listeners = new Set<ToastListener>()

function notify() {
  listeners.forEach((listener) => {
    listener([...toasts])
  })
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

function push(message: string, variant: ToastVariant, duration = 4000): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const item: ToastItem = { id, message, variant, duration }
  toasts = [...toasts, item]
  notify()

  if (duration > 0) {
    setTimeout(() => {
      dismiss(id)
    }, duration)
  }

  return id
}

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener)
  listener([...toasts])
  return () => {
    listeners.delete(listener)
  }
}

export const toast = {
  success: (message: string) => {
    return push(message, "success", 4000)
  },

  error: (message: string) => {
    return push(message, "error", 6000)
  },

  loading: (message: string) => {
    return push(message, "info", 0)
  },

  dismiss: (id?: string) => {
    if (id) {
      dismiss(id)
    } else {
      toasts = []
      notify()
    }
  },
}
