import { usePriceHistory } from "@/hooks/api"
import { useI18n } from "@/i18n/context"

export function ItemPriceHistory({ itemId, enabled }: { itemId: string; enabled?: boolean }) {
  const { t, formatPrice } = useI18n()
  const { data: history, isLoading } = usePriceHistory(itemId)

  if (!enabled) return null
  if (isLoading) return <p className="text-xs text-zinc-500">{t("common.loading")}</p>
  if (!history?.length) return null

  return (
    <div className="mt-2 pt-2 border-t border-zinc-800">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
        Price history
      </p>
      <ul className="space-y-1 max-h-24 overflow-y-auto">
        {history.slice(0, 5).map((row) => (
          <li key={row.id} className="flex justify-between text-xs text-zinc-400">
            <span>{new Date(row.checkedAt).toLocaleDateString()}</span>
            <span className="text-brand-400 font-semibold">
              {formatPrice(row.price, row.currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
