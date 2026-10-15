import { Toast } from "@ui-construction-library/core"
import { useEffect, useState } from "react"
import { subscribeToasts, type ToastItem, toast } from "@/lib/toast"

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    return subscribeToasts(setItems)
  }, [])

  if (items.length === 0) return null

  return (
    <section
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      {items.map((item) => (
        <Toast
          key={item.id}
          variant={item.variant}
          onClose={() => toast.dismiss(item.id)}
          className="pointer-events-auto shadow-2xl bg-zinc-900 border border-zinc-800 text-white rounded-xl p-4 flex items-center justify-between gap-3 text-sm font-medium"
        >
          <span>{item.message}</span>
        </Toast>
      ))}
    </section>
  )
}

export default Toaster
