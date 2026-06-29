import { Link } from "react-router-dom"
import { WishlistCard } from "@/components/WishlistCard"
import { useMySubscriptions, useUnsubscribe } from "@/hooks/api"
import { useI18n } from "@/i18n/context"

export default function FollowingPage() {
  const { data, isLoading } = useMySubscriptions()
  const unsubscribe = useUnsubscribe()
  const { t } = useI18n()

  return (
    <div className="flex flex-col h-full">
      {isLoading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={+i}
              className="h-24 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="flex-1 mobile-empty-state">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#52525b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Empty State"
          >
            <title>No subscriptions yet</title>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h3 className="mobile-empty-title mt-4">{t("following.empty_title")}</h3>
          <p className="mobile-empty-subtitle mb-6">{t("following.empty_subtitle")}</p>
          <Link
            to="/discover"
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
          >
            {t("profile.back_to_discover") || "Discover wishlists"}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((sub: any) => (
            <WishlistCard
              key={sub.id}
              wishlist={sub.wishlist}
              showUser={true}
              showPrivacy={false}
              action={
                <button
                  type="button"
                  onClick={() => unsubscribe.mutate(sub.id)}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all active:scale-95 shrink-0"
                >
                  {t("wishlist.unfollow")}
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
