import { useState } from "react"
import { Link } from "react-router-dom"
import {
  useDiscover,
  useSearchUsers,
  useSendFriendRequest,
  useSubscribe,
  useMe,
} from "@/hooks/api"
import { Wishlist, User } from "@/types"
import { UserAvatar } from "@/components/UserAvatar"
import { toast } from "react-hot-toast"
import { useI18n } from "@/i18n/context"
import { WishlistCard } from "@/components/WishlistCard"
import { Input } from "@/components/Input"

export default function DiscoverPage() {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"wishlists" | "users">("wishlists")

  const { data: wishlistData, isLoading: wishlistsLoading } =
    useDiscover(search)
  const { data: userData, isLoading: usersLoading } = useSearchUsers(search)
  const { data: me } = useMe()
  const sendFriendRequest = useSendFriendRequest()
  const subscribe = useSubscribe()
  const { t } = useI18n()

  const filteredWishlists = wishlistData?.wishlists.filter(
    (wl) => wl.user?.id !== me?.id,
  )

  const handleAddFriend = (userId: string) => {
    sendFriendRequest.mutate(userId, {
      onSuccess: () => toast.success(t("discover.request_sent_success")),
      onError: (err: any) => {
        const msg = err.response?.data?.message || t("discover.request_error")
        toast.error(msg)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full relative group">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-400 transition-colors"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12"
              placeholder={
                tab === "wishlists"
                  ? t("discover.search_placeholder_lists")
                  : t("discover.search_placeholder_users")
              }
            />
          </div>

          <div className="flex bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-zinc-800 shadow-xl w-full sm:w-auto overflow-x-auto scrollbar-hide h-[46px]">
            <button
              onClick={() => setTab("wishlists")}
              className={`flex-1 sm:flex-none px-8 rounded-lg text-sm font-bold transition-all active:scale-95 whitespace-nowrap h-full ${
                tab === "wishlists"
                  ? "bg-zinc-800 text-brand-400 shadow-sm shadow-black/50"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t("discover.tab_wishlists")}
            </button>
            <button
              onClick={() => setTab("users")}
              className={`flex-1 sm:flex-none px-8 rounded-lg text-sm font-bold transition-all active:scale-95 whitespace-nowrap h-full ${
                tab === "users"
                  ? "bg-zinc-800 text-brand-400 shadow-sm shadow-black/50"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t("discover.tab_users")}
            </button>
          </div>
        </div>
      </div>

      {tab === "wishlists" ? (
        wishlistsLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : !wishlistData?.wishlists.length ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 italic">
              {search
                ? t("discover.no_results_lists")
                : t("discover.no_public_lists")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
              {t("discover.results_count", {
                count: filteredWishlists?.length || 0,
              })}
            </p>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWishlists?.map((wl: Wishlist) => (
                <WishlistCard
                  key={wl.id}
                  wishlist={wl}
                  showUser={true}
                  showPrivacy={false}
                  action={
                    <button
                      onClick={() =>
                        subscribe.mutate(
                          { wishlistId: wl.id },
                          {
                            onSuccess: () =>
                              toast.success(t("wishlist.follow") + "!"),
                          },
                        )
                      }
                      className="px-3 py-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 hover:bg-brand-400/5 rounded-lg transition-all active:scale-95 shrink-0"
                    >
                      {t("wishlist.follow")}
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )
      ) : /* Users Tab */
      usersLoading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : userData && userData.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {userData.map((u: User) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-4 bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all group shadow-sm"
            >
              <Link
                to={`/users/${u.id}`}
                className="flex items-center gap-3 active:scale-95 transition-transform"
              >
                <UserAvatar
                  user={u}
                  size="md"
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <span className="font-bold text-zinc-100 group-hover:text-white transition-colors">
                  {u.displayName}
                </span>
              </Link>
              <button
                onClick={() => handleAddFriend(u.id)}
                disabled={sendFriendRequest.isPending}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-brand-500/10"
              >
                {sendFriendRequest.isPending ? "..." : t("discover.add_friend")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
          <p className="text-zinc-500 italic">
            {search
              ? t("discover.no_results_users")
              : t("discover.search_users_hint")}
          </p>
        </div>
      )}
    </div>
  )
}
