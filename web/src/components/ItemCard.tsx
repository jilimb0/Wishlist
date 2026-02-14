import { WishlistItem, User } from "@/types"
import { useI18n } from "@/i18n/context"

interface ItemCardProps {
  item: WishlistItem
  isOwner: boolean
  user: User | null
  onEdit?: (item: WishlistItem) => void
  onRemove?: (id: string) => void
  onReserve?: (id: string) => void
  onCancelReserve?: (reservationId: string) => void
}

export function ItemCard({
  item,
  isOwner,
  user,
  onEdit,
  onRemove,
  onReserve,
  onCancelReserve,
}: ItemCardProps) {
  const { t, formatPrice } = useI18n()

  return (
    <div className="flex flex-col bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group shadow-sm hover:shadow-xl hover:shadow-brand-500/5 backdrop-blur-3xl">
      {/* Image Section */}
      <div className="relative aspect-4/3 bg-zinc-800">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
            🎁
          </div>
        )}

        {item.reservation?.isReserved && (
          <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
            RESERVED
          </div>
        )}

        {/* Action Overlays (for owner) */}
        {isOwner && (
          <div className="absolute top-2 left-2 flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit?.(item)}
              title="Edit Item"
              className="p-2 bg-black/60 hover:bg-brand-500 hover:text-black text-white rounded-lg backdrop-blur-sm transition-all"
            >
              ✏️
            </button>
            <button
              onClick={() => onRemove?.(item.id)}
              title="Remove Item"
              className="p-2 bg-black/60 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-all"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-2.5 flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          <h3 className="font-bold text-sm line-clamp-1 mb-0.5 text-zinc-100">
            {item.title}
          </h3>
          {item.currentPrice && (
            <p className="text-brand-400 font-bold text-xs">
              {formatPrice(item.currentPrice, item.currency)}
            </p>
          )}
          {item.description && (
            <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-2.5 flex items-center justify-between gap-1.5">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold rounded-lg transition-colors border border-zinc-700/50"
            >
              View ↗
            </a>
          ) : (
            <div className="flex-1" />
          )}

          {!isOwner && (
            <div className="flex-1">
              {!item.reservation?.isReserved ? (
                <button
                  onClick={() => onReserve?.(item.id)}
                  className="w-full py-1.5 bg-brand-500 hover:bg-brand-600 text-black text-[11px] font-bold rounded-lg transition-colors"
                >
                  Reserve
                </button>
              ) : (
                item.reservation.userId === user?.id && (
                  <button
                    onClick={() => onCancelReserve?.(item.reservation!.id!)}
                    className="w-full py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-bold rounded-lg transition-colors border border-red-500/20"
                  >
                    Cancel
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
