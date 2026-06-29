import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { WishlistForm } from "@/components/Forms"
import { Modal } from "@/components/Modal"
import { WishlistCard } from "@/components/WishlistCard"
import {
  useAddItem,
  useCreateWishlist,
  useDeleteWishlist,
  useDiscover,
  useMe,
  useMySubscriptions,
  useMyWishlists,
} from "@/hooks/api"
import { useI18n } from "@/i18n/context"
import type { Wishlist } from "@/types"

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const wishlists = useMyWishlists()
  const subscriptions = useMySubscriptions()
  const { data: me } = useMe()
  const { data: discoverData } = useDiscover("", 50)
  const createWishlist = useCreateWishlist()
  const addItem = useAddItem()
  const deleteWishlist = useDeleteWishlist()
  const [deleteWishlistId, setDeleteWishlistId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [stateFilter, setStateFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL")
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "TITLE">("NEWEST")
  const { t } = useI18n()

  const followingCount = subscriptions.data?.length || 0
  const discoverCount =
    discoverData?.wishlists?.filter(
      (wl) => wl.user?.id !== me?.id && !subscriptions.data?.some((s) => s.wishlistId === wl.id),
    ).length || 0

  const filteredWishlists = useMemo(() => {
    const list = [...(wishlists.data || [])]

    const filtered = list.filter((wl) => {
      const matchesType = typeFilter === "ALL" || (wl.type || "Other") === typeFilter
      const matchesSearch =
        !search.trim() ||
        wl.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        (wl.description || "").toLowerCase().includes(search.trim().toLowerCase()) ||
        (wl.type || "").toLowerCase().includes(search.trim().toLowerCase())
      const isCompleted =
        !!wl.items?.length && wl.items.every((item) => item.status === "COMPLETED")
      const matchesState =
        stateFilter === "ALL" || (stateFilter === "COMPLETED" ? isCompleted : !isCompleted)

      return matchesType && matchesSearch && matchesState
    })

    filtered.sort((a: Wishlist, b: Wishlist) => {
      if (sortBy === "TITLE") return a.title.localeCompare(b.title)
      if (sortBy === "OLDEST") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  }, [wishlists.data, typeFilter, stateFilter, search, sortBy])

  const typeOptions = useMemo(() => {
    const values = new Set((wishlists.data || []).map((wl) => wl.type || "Other"))
    return ["ALL", ...Array.from(values)]
  }, [wishlists.data])

  return (
    <div className="flex flex-col h-full">
      <section className="flex flex-col h-full">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-white">All Wishlists</h1>
          <div className="mt-3 flex items-center gap-2">
            <Link
              to="/discover"
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors inline-flex items-center gap-2"
            >
              Discover
              <span className="px-1.5 py-0.5 text-[10px] leading-none rounded-md bg-brand-500/20 text-brand-400 border border-brand-500/30">
                {discoverCount}
              </span>
            </Link>
            <Link
              to="/following"
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors inline-flex items-center gap-2"
            >
              Following
              <span className="px-1.5 py-0.5 text-[10px] leading-none rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                {followingCount}
              </span>
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wishlists..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "ALL" ? "All types" : opt}
                </option>
              ))}
            </select>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as "ALL" | "ACTIVE" | "COMPLETED")}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
            >
              <option value="ALL">All states</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "NEWEST" | "OLDEST" | "TITLE")}
              className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700 md:col-span-3"
            >
              <option value="NEWEST">Sort: Newest first</option>
              <option value="OLDEST">Sort: Oldest first</option>
              <option value="TITLE">Sort: Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Create Wishlist Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={t("form.new_wishlist")}
          fullWidth
          centered
        >
          <WishlistForm
            onSubmit={(data: any) => {
              const { firstWishTitle, ...wishlistData } = data
              return createWishlist.mutate(wishlistData, {
                onSuccess: (createdWishlist) => {
                  if (firstWishTitle?.trim()) {
                    addItem.mutate({
                      wishlistId: createdWishlist.id,
                      title: firstWishTitle.trim(),
                      url: "",
                    })
                  }
                  setShowForm(false)
                  navigate(`/wishlists/${createdWishlist.id}`)
                },
              })
            }}
            isLoading={createWishlist.isPending}
            mobileMode={window.innerWidth < 768}
          />
        </Modal>

        <Modal
          isOpen={!!deleteWishlistId}
          onClose={() => setDeleteWishlistId(null)}
          title={t("common.delete")}
          fullWidth
          footer={
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteWishlistId(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteWishlistId) {
                    deleteWishlist.mutate(deleteWishlistId, {
                      onSuccess: () => setDeleteWishlistId(null),
                    })
                  }
                }}
                disabled={deleteWishlist.isPending}
                className="px-5 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/10 disabled:opacity-50"
              >
                {deleteWishlist.isPending ? t("common.loading") : t("common.delete")}
              </button>
            </div>
          }
        >
          <p>{t("wishlist.delete_confirm")}</p>
        </Modal>

        {wishlists.isLoading ? (
          <LoadingGrid />
        ) : wishlists.data?.length === 0 ? (
          <div className="flex-1 mobile-empty-state">
            <span className="mobile-empty-icon">🎁</span>
            <h3 className="mobile-empty-title">{t("dashboard.mobile_empty_title")}</h3>
            <p className="mobile-empty-subtitle">{t("dashboard.mobile_empty_subtitle")}</p>
            <button type="button" className="mobile-empty-action" onClick={() => setShowForm(true)}>
              {t("dashboard.create_wishlist")}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWishlists.map((wl: any) => (
              <WishlistCard
                key={wl.id}
                wishlist={wl}
                showPrivacy={true}
                action={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteWishlistId(wl.id)
                    }}
                    className="p-1 text-zinc-600 hover:text-red-400 md:opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ✕
                  </button>
                }
              />
            ))}
            {!filteredWishlists.length && (
              <div className="col-span-full text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                No wishlists match current filters
              </div>
            )}

            {/* Floating Action Button */}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="fixed bottom-20 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-black rounded-full shadow-2xl shadow-brand-500/20 flex items-center justify-center transition-all active:scale-90 z-40 group"
              title={t("dashboard.create_wishlist")}
            >
              <span className="text-2xl transition-transform group-hover:rotate-90">➕</span>
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={+i}
          className="h-24 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse"
        />
      ))}
    </div>
  )
}
