import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ItemForm, WishlistForm } from "@/components/Forms"
import { ItemCard } from "@/components/ItemCard"
import { Modal } from "@/components/Modal"
import { useAuth } from "@/context/AuthContext"
import {
  useAddItem,
  useCancelReservation,
  useDeleteItem,
  useDeleteWishlist,
  useReserveItem,
  useSubscribe,
  useUnsubscribe,
  useUpdateItem,
  useUpdateWishlist,
  useWishlist,
} from "@/hooks/api"
import { useI18n } from "@/i18n/context"
import type { Item, User } from "@/types"

export default function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: wishlist, isLoading, error } = useWishlist(id!)
  const addItem = useAddItem()
  const deleteItem = useDeleteItem()
  const reserveItem = useReserveItem()
  const cancelReservation = useCancelReservation()
  const updateWishlist = useUpdateWishlist()
  const deleteWishlist = useDeleteWishlist()
  const subscribe = useSubscribe()
  const unsubscribe = useUnsubscribe()
  const { t } = useI18n()

  const [showAddItem, setShowAddItem] = useState(false)
  const [showEditList, setShowEditList] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteWishlistId, setDeleteWishlistId] = useState<string | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID")
  const [sortMode, setSortMode] = useState<"NEWEST" | "OLDEST" | "TITLE" | "PRICE">("NEWEST")

  const updateItem = useUpdateItem()

  const isOwner = wishlist?.userId === user?.id

  const handleShare = async () => {
    if (!wishlist) return
    const shareUrl = `${window.location.origin}/wishlists/${wishlist.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: wishlist.title,
          text: `Check out this wishlist: ${wishlist.title}`,
          url: shareUrl,
        })
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      toast.success("Wishlist link copied")
    } catch (_error) {
      toast.error("Could not share wishlist")
    }
  }

  useEffect(() => {
    if (wishlist?.id) {
      localStorage.setItem("lastActiveWishlistId", wishlist.id)
    }
  }, [wishlist?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-400">{(error as Error).message || "Could not load wishlist"}</p>
        <Link to="/lists" className="text-brand-400 hover:underline text-sm">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  if (!wishlist) return null

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      {/* ─── Modals ───────────────────────────────── */}
      <Modal
        isOpen={!!deleteWishlistId}
        onClose={() => setDeleteWishlistId(null)}
        title="Delete Wishlist"
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteWishlistId(null)}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteWishlistId) {
                  deleteWishlist.mutate(deleteWishlistId, {
                    onSuccess: () => navigate("/lists"),
                  })
                }
              }}
              disabled={deleteWishlist.isPending}
              className="px-6 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/10 disabled:opacity-50"
            >
              {deleteWishlist.isPending ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        }
      >
        <p>{t("wishlist.delete_confirm")}</p>
      </Modal>

      <Modal
        isOpen={!!deleteItemId}
        onClose={() => setDeleteItemId(null)}
        title="Remove Item"
        centered
        fullWidth
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteItemId(null)}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteItemId) {
                  deleteItem.mutate(deleteItemId, {
                    onSuccess: () => setDeleteItemId(null),
                  })
                }
              }}
              disabled={deleteItem.isPending}
              className="px-6 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/10 disabled:opacity-50"
            >
              {deleteItem.isPending ? "Removing..." : "Remove Item"}
            </button>
          </div>
        }
      >
        <p>Are you sure you want to remove this item from your wishlist?</p>
      </Modal>

      <Modal
        isOpen={showAddItem}
        onClose={() => setShowAddItem(false)}
        title={t("wishlist.add_item")}
        centered
        fullWidth
      >
        <ItemForm
          wishlistId={wishlist.id}
          onSubmit={(data) =>
            addItem.mutate(data, {
              onSuccess: () => setShowAddItem(false),
            })
          }
          isLoading={addItem.isPending}
        />
      </Modal>

      {/* ─── Header ────────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-2xl shrink-0">{wishlist.emoji || "🎁"}</span>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold text-white truncate min-w-0">{wishlist.title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-[8px] uppercase tracking-widest bg-brand-500/10 text-brand-400 px-1.5 py-0.5 rounded-md font-black border border-brand-500/20 whitespace-nowrap">
                {t(`wishlist.${wishlist.privacy.toLowerCase()}`)}
              </span>
              {wishlist.user && !isOwner && (
                <span className="text-[10px] text-zinc-500 truncate min-w-0">
                  {t("wishlist.by", { name: "" })}
                  <Link
                    to={`/users/${wishlist.user.id}`}
                    className="hover:text-brand-400 underline transition-colors"
                    style={{ marginLeft: "2px" }}
                  >
                    {wishlist.user.displayName}
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all active:scale-95"
            title="Share"
          >
            <div className="text-zinc-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Share"
              >
                <title>Share</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M8.59 13.51l6.83 3.98m0-10.98l-6.83 3.98m8.83-5.49a2 2 0 11-4 0 2 2 0 014 0zm0 14a2 2 0 11-4 0 2 2 0 014 0zM7 12a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </button>
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={() => setShowEditList(!showEditList)}
                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all active:scale-95"
                title="Edit"
              >
                <div className="text-zinc-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Edit"
                  >
                    <title>Edit</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDeleteWishlistId(wishlist.id)}
                className="p-2 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 text-red-500 rounded-xl transition-all active:scale-95"
                title="Delete"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Delete"
                >
                  <title>Delete</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          ) : wishlist.subscriptionId ? (
            <button
              type="button"
              onClick={() => unsubscribe.mutate(wishlist.subscriptionId!)}
              disabled={unsubscribe.isPending}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {wishlist.subscriptionStatus === "PENDING" ? "Cancel" : "Unfollow"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => subscribe.mutate({ wishlistId: wishlist.id })}
              disabled={subscribe.isPending}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-brand-500 hover:bg-brand-600 text-black rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-500/10 disabled:opacity-50"
            >
              {wishlist.privacy === "FRIENDS" ? t("wishlist.request_access") : t("wishlist.follow")}
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showEditList}
        onClose={() => setShowEditList(false)}
        title={t("common.update")}
        centered
        fullWidth
        mobileFullscreen
      >
        <WishlistForm
          initial={{
            title: wishlist.title,
            type: wishlist.type || "",
            description: wishlist.description || "",
            emoji: wishlist.emoji || "🎁",
            privacy: wishlist.privacy,
          }}
          onSubmit={(data) =>
            updateWishlist.mutate(
              { id: wishlist.id, ...data },
              { onSuccess: () => setShowEditList(false) },
            )
          }
          isLoading={updateWishlist.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={t("common.update")}
        centered
        fullWidth
        mobileFullscreen
      >
        {editingItem && (
          <ItemForm
            wishlistId={wishlist.id}
            initial={editingItem}
            onSubmit={(data) =>
              updateItem.mutate(
                { id: editingItem.id, wishlistId: wishlist.id, ...data },
                { onSuccess: () => setEditingItem(null) },
              )
            }
            isLoading={updateItem.isPending}
          />
        )}
      </Modal>

      {/* ─── Add item FAB ──────────────────────────── */}
      {isOwner && (
        <div className="fixed bottom-20 right-6 md:bottom-10 md:right-10 z-40">
          <button
            type="button"
            onClick={() => setShowAddItem(true)}
            className="w-14 h-14 bg-brand-500 hover:bg-brand-600 text-black rounded-full shadow-2xl shadow-brand-500/20 flex items-center justify-center transition-all active:scale-90 group"
            title={t("wishlist.add_item")}
          >
            <span className="text-2xl transition-transform group-hover:rotate-90">➕</span>
          </button>
        </div>
      )}

      {/* ─── Items list ────────────────────────────── */}
      {!wishlist.items?.length ? (
        <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
          {t("wishlist.no_items")}
        </div>
      ) : (
        <ItemsView
          items={wishlist.items}
          isOwner={isOwner}
          user={user}
          viewMode={viewMode}
          sortMode={sortMode}
          onChangeViewMode={setViewMode}
          onChangeSortMode={setSortMode}
          onToggleStatus={(item: Item) =>
            updateItem.mutate({
              id: item.id,
              wishlistId: wishlist.id,
              status: item.status === "COMPLETED" ? "ACTIVE" : "COMPLETED",
            })
          }
          onEdit={setEditingItem}
          onRemove={(id: string) => deleteItem.mutate(id)}
          onReserve={(id: string) => reserveItem.mutate({ itemId: id })}
          onCancelReserve={(id: string) => cancelReservation.mutate(id)}
        />
      )}
    </div>
  )
}

interface ItemsViewProps {
  items: Item[]
  isOwner: boolean
  user: User | null
  viewMode: "GRID" | "LIST"
  sortMode: "NEWEST" | "OLDEST" | "TITLE" | "PRICE"
  onChangeViewMode: (mode: "GRID" | "LIST") => void
  onChangeSortMode: (mode: "NEWEST" | "OLDEST" | "TITLE" | "PRICE") => void
  onToggleStatus: (item: Item) => void
  onEdit: (item: Item) => void
  onRemove: (id: string) => void
  onReserve: (id: string) => void
  onCancelReserve: (id: string) => void
}

function ItemsView({
  items,
  isOwner,
  user,
  viewMode,
  sortMode,
  onChangeViewMode,
  onChangeSortMode,
  onToggleStatus,
  onEdit,
  onRemove,
  onReserve,
  onCancelReserve,
}: ItemsViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const sortedItems = [...items].sort((a, b) => {
    if (sortMode === "TITLE") return a.title.localeCompare(b.title)
    if (sortMode === "PRICE") return (b.currentPrice || 0) - (a.currentPrice || 0)
    if (sortMode === "OLDEST") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeViewMode("GRID")}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
              viewMode === "GRID"
                ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400"
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode("LIST")}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
              viewMode === "LIST"
                ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400"
            }`}
          >
            List
          </button>
        </div>

        <select
          value={sortMode}
          onChange={(e) =>
            onChangeSortMode(e.target.value as "NEWEST" | "OLDEST" | "TITLE" | "PRICE")
          }
          className="px-2.5 py-1.5 text-xs rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-zinc-700"
        >
          <option value="NEWEST">Newest</option>
          <option value="OLDEST">Oldest</option>
          <option value="TITLE">Title</option>
          <option value="PRICE">Price</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide pb-4">
        {viewMode === "GRID" ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {currentItems.map((item: Item) => (
              <ItemCard
                key={item.id}
                item={item}
                isOwner={isOwner}
                user={user}
                onToggleStatus={onToggleStatus}
                onEdit={onEdit}
                onRemove={onRemove}
                onReserve={onReserve}
                onCancelReserve={onCancelReserve}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {currentItems.map((item: Item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      item.status === "COMPLETED"
                        ? "bg-green-500"
                        : item.reservation?.isReserved
                          ? "bg-yellow-500"
                          : "bg-zinc-600"
                    }`}
                    title={item.status === "COMPLETED" ? "Completed" : "Active"}
                  />
                  <p
                    className={`text-sm truncate ${item.status === "COMPLETED" ? "text-zinc-500 line-through" : "text-zinc-100"}`}
                  >
                    {item.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => onToggleStatus(item)}
                      className="px-2.5 py-1.5 text-[11px] rounded-lg border border-green-500/20 text-green-400 hover:bg-green-500/10"
                    >
                      {item.status === "COMPLETED" ? "Undo" : "Done"}
                    </button>
                  )}
                  {!isOwner && !item.reservation?.isReserved && (
                    <button
                      type="button"
                      onClick={() => onReserve(item.id)}
                      className="px-2.5 py-1.5 text-[11px] rounded-lg border border-zinc-700 text-zinc-300 hover:border-brand-500/40 hover:text-brand-300"
                    >
                      Reserve
                    </button>
                  )}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="px-2.5 py-1.5 text-[11px] rounded-lg border border-zinc-700 text-zinc-300 hover:text-white"
                    >
                      Edit
                    </button>
                  )}
                  {(isOwner || (item.reservation?.id && item.reservation?.userId === user?.id)) && (
                    <button
                      type="button"
                      onClick={() =>
                        item.reservation?.id && item.reservation?.userId === user?.id
                          ? onCancelReserve(item.reservation.id)
                          : onRemove(item.id)
                      }
                      className="px-2.5 py-1.5 text-[11px] rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      {item.reservation?.id && item.reservation?.userId === user?.id
                        ? "Unreserve"
                        : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex-none mt-auto py-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50 rounded-lg disabled:opacity-20 transition-all active:scale-90"
            >
              <span className="text-zinc-400">←</span>
            </button>
            <div className="px-3 py-1 bg-zinc-900/30 rounded-lg border border-zinc-800/30">
              <span className="text-[10px] uppercase tracking-widest font-black text-zinc-500">
                {currentPage} / {totalPages}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50 rounded-lg disabled:opacity-20 transition-all active:scale-90"
            >
              <span className="text-zinc-400">→</span>
            </button>
          </div>

          <div className="flex gap-1.5 px-3 py-1.5 bg-zinc-900/20 rounded-full border border-zinc-800/10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  currentPage === page ? "bg-brand-500 w-3" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
