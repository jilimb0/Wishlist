import {
  useApproveSubscription,
  usePendingSubscriptions,
  useRejectSubscription,
} from "@/hooks/api"
import { useI18n } from "@/i18n/context"
import { UserAvatar } from "./UserAvatar"

export function PendingSubscriptions() {
  const { t } = useI18n()
  const { data: pending, isLoading } = usePendingSubscriptions()
  const approve = useApproveSubscription()
  const reject = useRejectSubscription()

  if (isLoading) {
    return <p className="text-sm text-zinc-500">{t("common.loading")}</p>
  }

  if (!pending?.length) {
    return (
      <p className="text-sm text-zinc-500 italic">{t("subscriptions.no_pending")}</p>
    )
  }

  return (
    <ul className="space-y-3">
      {pending.map((sub) => (
        <li
          key={sub.id}
          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
        >
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={sub.user} size="sm" />
            <div className="min-w-0">
              <p className="font-semibold text-zinc-100 truncate">{sub.user.displayName}</p>
              <p className="text-xs text-zinc-500 truncate">
                {sub.wishlist.emoji} {sub.wishlist.title}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => reject.mutate(sub.id)}
              disabled={reject.isPending}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border border-zinc-700 text-zinc-400 hover:text-red-400"
            >
              {t("common.reject")}
            </button>
            <button
              type="button"
              onClick={() => approve.mutate(sub.id)}
              disabled={approve.isPending}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-brand-500 text-black"
            >
              {t("common.approve")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
