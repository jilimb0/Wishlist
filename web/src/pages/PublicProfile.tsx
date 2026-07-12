import { useState } from "react"
import { toast } from "react-hot-toast"
import { Link, useParams } from "react-router-dom"
import { Modal } from "@/components/Modal"
import { UserAvatar } from "@/components/UserAvatar"
import { WishlistCard } from "@/components/WishlistCard"
import {
  useDiscoverByUser,
  useFriends,
  useMe,
  useMySubscriptions,
  usePendingFriends,
  usePublicProfile,
  useRemoveFriendship,
  useSendFriendRequest,
  useSubscribe,
  useUnsubscribe,
} from "@/hooks/api"
import { useI18n } from "@/i18n/context"

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: me } = useMe()
  const { data: user, isLoading: userLoading, error } = usePublicProfile(id!)
  const { data: wishlists, isLoading: wishlistsLoading } = useDiscoverByUser(id!)
  const friends = useFriends()
  const pendingFriends = usePendingFriends()
  const sendFriendRequest = useSendFriendRequest()
  const removeFriendship = useRemoveFriendship()
  const subscribe = useSubscribe()
  const unsubscribe = useUnsubscribe()
  const subscriptions = useMySubscriptions()
  const { t } = useI18n()

  // All hooks MUST be called before any conditional returns (React Rules of Hooks)
  const [modal, setModal] = useState<{
    isOpen: boolean
    message: string
    action: () => void
  }>({
    isOpen: false,
    message: "",
    action: () => {},
  })

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
        <h2 className="text-xl font-bold text-red-400">{t("profile.user_not_found")}</h2>
        <Link to="/discover" className="text-brand-400 hover:underline mt-2 inline-block">
          {t("profile.back_to_discover")}
        </Link>
      </div>
    )
  }

  const isMe = me?.id === user.id
  const isFriend = friends.data?.some((f) => f.id === user.id)
  const pendingRequest = pendingFriends.data?.find(
    (f) => f.userId === user.id || f.friendId === user.id,
  )
  const isPending = !!pendingRequest

  const handleAddFriend = () => {
    sendFriendRequest.mutate(user.id, {
      onSuccess: () => {
        toast.success(t("discover.request_sent_success"))
        pendingFriends.refetch()
      },
      onError: () => toast.error(t("discover.request_error")),
    })
  }

  const handleRemoveFriend = (friendshipId: string, confirmMsg?: string) => {
    setModal({
      isOpen: true,
      message: confirmMsg || t("discover.remove_friend_confirm"),
      action: () => {
        removeFriendship.mutate(friendshipId, {
          onSuccess: () => {
            friends.refetch()
            pendingFriends.refetch()
            setModal((prev) => ({ ...prev, isOpen: false }))
          },
        })
      },
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-2">
        <div className="relative group">
          <div className="absolute -inset-2 bg-linear-to-r from-brand-400 to-brand-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <UserAvatar
            user={user}
            size="xl"
            className="relative ring-4 ring-zinc-900 shadow-2xl scale-110"
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight">{user.displayName}</h1>
          <p className="text-zinc-500 font-medium">{user.email}</p>
        </div>

        {!isMe && (
          <div className="pt-2 flex flex-col items-center gap-2">
            {isFriend ? (
              <button
                type="button"
                onClick={() => {
                  const f = friends.data?.find((f) => f.id === user.id)
                  if (f?.friendshipId) {
                    handleRemoveFriend(f.friendshipId)
                  }
                }}
                className="group px-6 py-2 bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest rounded-xl border border-zinc-700 active:scale-95 transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
              >
                <span className="block group-hover:hidden">{t("profile.friends")}</span>
                <span className="hidden group-hover:block">{t("common.remove")}</span>
              </button>
            ) : isPending ? (
              <div className="flex flex-col items-center gap-2">
                <span className="px-6 py-2 bg-zinc-800/50 text-brand-400/50 text-xs font-black uppercase tracking-widest rounded-xl border border-brand-400/10">
                  {t("discover.friend_request_sent")}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveFriend(pendingRequest.id, t("discover.cancel_request_confirm"))
                  }
                  className="text-[10px] font-bold text-zinc-500 hover:text-red-400 transition-colors"
                >
                  {t("discover.cancel_request")}
                </button>
              </div>
            ) : (
              <button
                type="button"
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
                key={+i}
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
            {wishlists.map((wl: Record<string, unknown>) => {
              const subscription = subscriptions.data?.find((s) => s.wishlistId === wl.id)
              const isSubscribed = !!subscription

              return (
                <WishlistCard
                  key={wl.id}
                  wishlist={wl}
                  showPrivacy={false}
                  action={
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (isSubscribed) {
                          unsubscribe.mutate(subscription!.id, {
                            onSuccess: () => toast.success(`${t("wishlist.unfollow")}!`),
                          })
                        } else {
                          subscribe.mutate(
                            { wishlistId: wl.id },
                            {
                              onSuccess: () => toast.success(`${t("wishlist.follow")}!`),
                            },
                          )
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 shrink-0 ${
                        isSubscribed
                          ? "bg-zinc-800 text-zinc-400 hover:text-white"
                          : "text-brand-400 hover:text-brand-300 hover:bg-brand-400/5"
                      }`}
                    >
                      {isSubscribed ? t("wishlist.unfollow") : t("wishlist.follow")}
                    </button>
                  }
                />
              )
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        title={t("common.delete")}
      >
        <div className="space-y-6">
          <p className="text-zinc-400">{modal.message}</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={modal.action}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/20"
            >
              {t("common.delete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
