import { useState } from "react"
import { Link } from "react-router-dom"
import {
  useMyWishlists,
  useCreateWishlist,
  useDeleteWishlist,
  useMySubscriptions,
} from "@/hooks/api"
import { WishlistForm } from "@/components/Forms"
import { Modal } from "@/components/Modal"
import { BottomSheet } from "@/components/BottomSheet"
import { useI18n } from "@/i18n/context"
import { WishlistCard } from "@/components/WishlistCard"

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false)
  const wishlists = useMyWishlists()
  const subscriptions = useMySubscriptions()
  const createWishlist = useCreateWishlist()
  const deleteWishlist = useDeleteWishlist()
  const [deleteWishlistId, setDeleteWishlistId] = useState<string | null>(null)
  const { t } = useI18n()

  return (
    <div className="flex flex-col h-full">
      <section className="flex flex-col h-full">
        {/* Create Wishlist Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={t("form.new_wishlist")}
          fullWidth
          centered
        >
          <WishlistForm
            onSubmit={(data: any) =>
              createWishlist.mutate(data, {
                onSuccess: () => setShowForm(false),
              })
            }
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
                onClick={() => setDeleteWishlistId(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
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
                {deleteWishlist.isPending
                  ? t("common.loading")
                  : t("common.delete")}
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
            <h3 className="mobile-empty-title">
              {t("dashboard.mobile_empty_title")}
            </h3>
            <p className="mobile-empty-subtitle">
              {t("dashboard.mobile_empty_subtitle")}
            </p>
            <button
              className="mobile-empty-action"
              onClick={() => setShowForm(true)}
            >
              {t("dashboard.create_wishlist")}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {wishlists.data?.map((wl: any) => (
              <WishlistCard
                key={wl.id}
                wishlist={wl}
                showPrivacy={true}
                action={
                  <button
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

            {/* Floating Action Button */}
            <button
              onClick={() => setShowForm(true)}
              className="fixed bottom-20 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-black rounded-full shadow-2xl shadow-brand-500/20 flex items-center justify-center transition-all active:scale-90 z-40 group"
              title={t("dashboard.create_wishlist")}
            >
              <span className="text-2xl transition-transform group-hover:rotate-90">
                ➕
              </span>
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
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-24 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse"
        />
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
      {message}
    </div>
  )
}
