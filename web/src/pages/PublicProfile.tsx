import { useParams } from "react-router-dom"
import {
  usePublicProfile,
  useDiscoverByUser,
  useMe,
  useFriends,
  usePendingFriends,
  useSendFriendRequest,
  useSubscribe,
} from "@/hooks/api"
import { UserAvatar } from "@/components/UserAvatar"
import { Link } from "react-router-dom"
import { useI18n } from "@/i18n/context"
import { WishlistCard } from "@/components/WishlistCard"
import { toast } from "react-hot-toast"

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: me } = useMe()
  const { data: user, isLoading: userLoading, error } = usePublicProfile(id!)
  const { data: wishlists, isLoading: wishlistsLoading } = useDiscoverByUser(
    id!,
  )
  const friends = useFriends()
  const pendingFriends = usePendingFriends()
  const sendFriendRequest = useSendFriendRequest()
  const subscribe = useSubscribe()
  const { t } = useI18n()

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-400">
          {t("profile.user_not_found")}
        </h2>
        <Link
          to="/discover"
          className="text-brand-400 hover:underline mt-2 inline-block"
        >
          {t("profile.back_to_discover")}
        </Link>
      </div>
    )
  }

  const isMe = me?.id === user.id
  const isFriend = friends.data?.some((f) => f.id === user.id)
  const isPending = pendingFriends.data?.some(
    (f) => f.senderId === user.id || f.receiverId === user.id,
  )

  const handleAddFriend = () => {
    sendFriendRequest.mutate(user.id, {
      onSuccess: () => toast.success(t("discover.request_sent_success")),
      onError: () => toast.error(t("discover.request_error")),
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-2">
        <div className="relative group">
          <div className="absolute -inset-2 bg-linear-to-r from-brand-400 to-brand-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <UserAvatar
            user={user}
            size="xl"
            className="relative ring-4 ring-zinc-900 shadow-2xl scale-110"
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight">
            {user.displayName}
          </h1>
          <p className="text-zinc-500 font-medium">{user.email}</p>
        </div>

        {!isMe && (
          <div className="pt-2">
            {isFriend ? (
              <span className="px-6 py-2 bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest rounded-xl border border-zinc-700">
                {t("profile.friends")}
              </span>
            ) : isPending ? (
              <span className="px-6 py-2 bg-zinc-800/50 text-brand-400/50 text-xs font-black uppercase tracking-widest rounded-xl border border-brand-400/10">
                {t("discover.friend_request_sent")}
              </span>
            ) : (
              <button
                onClick={handleAddFriend}
                disabled={sendFriendRequest.isPending}
                className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-500/10 disabled:opacity-50"
              >
                {sendFriendRequest.isPending ? "..." : t("discover.add_friend")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🎁</span> {t("profile.public_wishlists")}
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">
            {t("discover.results_count", { count: wishlists?.length || 0 })}
          </span>
        </div>

        {wishlistsLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : !wishlists?.length ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 italic">
              {t("profile.no_public_wishlists", { name: user.displayName })}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {wishlists.map((wl: any) => (
              <WishlistCard
                key={wl.id}
                wishlist={wl}
                showPrivacy={false}
                action={
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      subscribe.mutate(
                        { wishlistId: wl.id },
                        {
                          onSuccess: () =>
                            toast.success(t("wishlist.follow") + "!"),
                        },
                      )
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 hover:bg-brand-400/5 rounded-lg transition-all active:scale-95 shrink-0"
                  >
                    {t("wishlist.follow")}
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
