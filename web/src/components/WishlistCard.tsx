import { Link } from "react-router-dom"
import { useI18n } from "@/i18n/context"
import type { Wishlist } from "@/types"

interface WishlistCardProps {
  wishlist: Wishlist
  action?: React.ReactNode
  showUser?: boolean
  showPrivacy?: boolean
  className?: string
}

export function WishlistCard({
  wishlist,
  action,
  showUser = false,
  showPrivacy = true,
  className = "",
}: WishlistCardProps) {
  const { t } = useI18n()
  return (
    <Link
      to={`/wishlists/${wishlist.id}`}
      className={`group flex flex-col justify-center p-5 min-h-[100px] bg-zinc-900/50 backdrop-blur-3xl border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all shadow-sm hover:shadow-xl hover:shadow-brand-500/5 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300 shrink-0">
            {wishlist.emoji || "🎁"}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-zinc-100 group-hover:text-brand-400 transition-colors line-clamp-1">
              {wishlist.title}
            </h3>
            <p className="text-[10px] uppercase tracking-wider font-black text-zinc-500 flex items-center gap-1.5 mt-0.5 overflow-hidden">
              <span className="truncate">
                {t("dashboard.item_count", {
                  count: wishlist._count?.items || 0,
                })}
              </span>
              {showUser && wishlist.user && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                  <span className="truncate">
                    {t("wishlist.by", { name: wishlist.user.displayName })}
                  </span>
                </span>
              )}
              {showPrivacy && (
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  {t(`wishlist.${wishlist.privacy.toLowerCase()}`)}
                </span>
              )}
              {wishlist.type && (
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="truncate">Type: {wishlist.type}</span>
                </span>
              )}
            </p>
          </div>
        </div>
        {action && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: Stop propagation wrapper only
          // biome-ignore lint/a11y/noStaticElementInteractions: Stop propagation wrapper
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {action}
          </div>
        )}
      </div>
      {wishlist.description && (
        <p className="mt-3 text-xs text-zinc-500 line-clamp-2 leading-relaxed h-8">
          {wishlist.description}
        </p>
      )}
    </Link>
  )
}
