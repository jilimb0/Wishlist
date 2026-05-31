import { ItemPriceHistory } from "@/components/ItemPriceHistory"
import { useI18n } from "@/i18n/context"
import type { Item, User } from "@/types"
import { useState } from "react"

interface ItemCardProps {
  item: Item
  isOwner: boolean
  user: User | null
  onToggleStatus?: (item: Item) => void
  onEdit?: (item: Item) => void
  onRemove?: (id: string) => void
  onReserve?: (id: string) => void
  onCancelReserve?: (reservationId: string) => void
}

export function ItemCard({
  item,
  isOwner,
  user,
  onToggleStatus,
  onEdit,
  onRemove,
  onReserve,
  onCancelReserve,
}: ItemCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { t, formatPrice } = useI18n()

  return (
    <div className="relative h-full perspective-1000">
      <div
        className={`relative w-full h-full transition-all duration-500 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Side */}
        <div className="backface-hidden w-full h-full">
          <div className="flex flex-col h-full bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group shadow-sm">
            <div className="aspect-square w-full relative overflow-hidden bg-zinc-950/50">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-800">
                  <span className="text-3xl">🎁</span>
                </div>
              )}

              {isOwner && (
                <div className="absolute top-2 right-2 flex gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEdit?.(item)}
                    className="p-1.5 bg-zinc-900/90 backdrop-blur-md text-zinc-400 hover:text-brand-400 rounded-lg border border-zinc-800 transition-all active:scale-90"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="p-1.5 bg-red-500/10 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all active:scale-90"
                  >
                    🗑️
                  </button>
                </div>
              )}

              {item.reservation?.isReserved && (
                <div className="absolute top-2 right-2 bg-green-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg uppercase tracking-widest">
                  {t("wishlist.reserved")}
                </div>
              )}
            </div>

            <div className="p-2.5 flex flex-col flex-1 min-w-0">
              <div className="flex-1 min-w-0 mb-2">
                <h3 className="text-xs font-black text-zinc-100 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                  <span className={item.status === "COMPLETED" ? "line-through text-zinc-500" : ""}>
                    {item.title}
                  </span>
                </h3>
                {item.currentPrice && (
                  <p className="text-[10px] font-black text-brand-400 mt-0.5">
                    {formatPrice(item.currentPrice, item.currency)}
                  </p>
                )}
                {isOwner && (
                  <ItemPriceHistory itemId={item.id} enabled={item.trackPrice} />
                )}
              </div>

              {!isOwner && (
                <div className="mt-auto">
                  {item.reservation?.isReserved ? (
                    <button
                      type="button"
                      onClick={() => onCancelReserve?.(item.reservation!.id!)}
                      disabled={item.reservation?.userId !== user?.id}
                      className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        item.reservation?.userId === user?.id
                          ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                          : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      {item.reservation?.userId === user?.id
                        ? t("wishlist.cancel_reserve")
                        : t("wishlist.reserved")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onReserve?.(item.id)}
                      className="w-full py-1.5 bg-zinc-800 hover:bg-brand-500 hover:text-black text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 border border-zinc-700/50"
                    >
                      {t("wishlist.reserve")}
                    </button>
                  )}
                </div>
              )}
              {isOwner && (
                <div className="mt-auto flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onToggleStatus?.(item)}
                    className={`px-2 py-1 text-[9px] rounded-lg border transition-colors ${
                      item.status === "COMPLETED"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {item.status === "COMPLETED" ? "Completed" : "Mark done"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Side (Delete Confirmation) */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden w-full h-full">
          <div className="flex flex-col items-center justify-center h-full p-3 bg-zinc-900/95 backdrop-blur-xl border border-red-500/30 rounded-2xl text-center gap-3">
            <span className="text-xl">🗑️</span>
            <p className="text-[10px] font-bold text-zinc-300 leading-snug">
              {t("common.delete")} <span className="text-white font-black">«{item.title}»</span>?
            </p>
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="flex-1 py-2 bg-zinc-800 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-colors active:scale-95"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemove?.(item.id)
                  setIsFlipped(false)
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-colors active:scale-95"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
