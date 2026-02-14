import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "../hooks/api"
import { useI18n } from "../i18n/context"
import { DateTime } from "luxon"
import { NotificationType } from "../shared"

interface NotificationCenterProps {
  onClose: () => void
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { t, language } = useI18n()
  const { data, isLoading } = useNotifications(20)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const notifications = data?.notifications || []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm tracking-tight">
            {t("notifications.title")}
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-brand-500 text-[10px] font-black text-black rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-brand-400 transition-colors"
            >
              {t("notifications.mark_all_read")}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-3xl block mb-2 opacity-20">🔔</span>
            <p className="text-xs text-zinc-500 font-medium">
              {t("notifications.empty")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                className={`p-4 transition-colors cursor-pointer group relative ${
                  n.isRead ? "opacity-60" : "bg-brand-500/5"
                } hover:bg-zinc-800/50`}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
                )}
                <div className="flex gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
                    {n.type === NotificationType.RESERVATION
                      ? "🎁"
                      : n.type === NotificationType.NEW_ITEM
                        ? "✨"
                        : "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-200 mb-0.5">
                      {n.title}
                    </p>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-1.5 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-zinc-600 font-medium">
                      {DateTime.fromISO(n.createdAt)
                        .setLocale(language)
                        .toRelative()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-zinc-900/50 border-t border-zinc-800 text-center">
          <button className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 hover:text-white transition-colors">
            {t("notifications.view_all")}
          </button>
        </div>
      )}
    </div>
  )
}
