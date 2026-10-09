import { useState } from "react"
import { useActivatePromo, useBillingStatus, useCheckout } from "@/hooks/api"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { data: billing, isLoading } = useBillingStatus()
  const activatePromo = useActivatePromo()
  const checkout = useCheckout()

  const [promoCode, setPromoCode] = useState("")
  const [promoMessage, setPromoMessage] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "YEARLY">("YEARLY")

  if (!isOpen) return null

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return

    try {
      const res = await activatePromo.mutateAsync(promoCode.trim())
      setPromoMessage(res.message || "Промокод успешно активирован!")
      setPromoCode("")
    } catch (err) {
      setPromoMessage((err as Error).message || "Неверный промокод")
    }
  }

  const handleSubscribe = async () => {
    const res = await checkout.mutateAsync(selectedPlan)
    if (res.checkoutUrl) {
      window.location.href = res.checkoutUrl
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">WishTracker PRO</h2>
                <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 font-black text-[10px] rounded-full uppercase">
                  Premium
                </span>
              </div>
              <p className="text-xs text-zinc-400">Максимум возможностей для ваших вишлистов</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Status banner */}
        {!isLoading && billing && (
          <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white">
                Текущий статус:{" "}
                <span className={billing.isPro ? "text-brand-400" : "text-zinc-400"}>
                  {billing.isPro ? "PRO активен" : "Базовый (Free)"}
                </span>
              </p>
              {billing.trialDaysRemaining > 0 && (
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Осталось {billing.trialDaysRemaining} дн. бесплатного триала
                </p>
              )}
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-zinc-300">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Неограниченный автоматический трекинг цен на маркетплейсах</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-300">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Краудфандинг подарков: сбор средств с друзьями без ограничений</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-300">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Кастомные темы оформления и скрытые вишлисты (Secret Santa)</span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-300">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Мгновенные уведомления в Telegram без задержек</span>
          </div>
        </div>

        {/* Plan Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedPlan("MONTHLY")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedPlan === "MONTHLY"
                ? "bg-brand-500/10 border-brand-500 text-white"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">1 месяц</div>
            <div className="text-xl font-black mt-1">$4.99</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Оплата каждый месяц</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan("YEARLY")}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
              selectedPlan === "YEARLY"
                ? "bg-brand-500/10 border-brand-500 text-white"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <span className="absolute top-2 right-2 text-[9px] bg-brand-500 text-black font-black px-1.5 py-0.5 rounded-full uppercase">
              Скидка 35%
            </span>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">1 год</div>
            <div className="text-xl font-black mt-1">$39.99</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">~$3.33 в месяц</div>
          </button>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={checkout.isPending}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98"
        >
          {checkout.isPending
            ? "Перенаправляем..."
            : `Оформить PRO подписку (${selectedPlan === "YEARLY" ? "$39.99" : "$4.99"}) 🚀`}
        </button>

        {/* Promo code form */}
        <form onSubmit={handleApplyPromo} className="pt-2 border-t border-zinc-800/80 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Промокод (напр. WISHTRACKERPRO)"
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 uppercase"
            />
            <button
              type="submit"
              disabled={activatePromo.isPending || !promoCode.trim()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Применить
            </button>
          </div>
          {promoMessage && <p className="text-xs font-bold text-brand-400">{promoMessage}</p>}
        </form>
      </div>
    </div>
  )
}
