import { useState } from "react"
import { useAddGroupGiftContribution, useGroupGiftContributions } from "@/hooks/api"
import { useI18n } from "@/i18n/context"
import type { Item, User } from "@/types"

interface GroupGiftModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item
  currentUser: User | null
}

export function GroupGiftModal({ isOpen, onClose, item, currentUser }: GroupGiftModalProps) {
  const { formatPrice } = useI18n()
  const { data: contributionsData, isLoading } = useGroupGiftContributions(item.id)
  const addContribution = useAddGroupGiftContribution(item.id)

  const [name, setName] = useState(currentUser?.displayName || "")
  const [amount, setAmount] = useState<number | "">("")
  const [message, setMessage] = useState("")

  if (!isOpen) return null

  const targetAmount = item.targetAmount || contributionsData?.targetAmount || 0
  const totalContributed = contributionsData?.totalContributed ?? item.totalContributed ?? 0
  const percent =
    targetAmount > 0 ? Math.min(100, Math.round((totalContributed / targetAmount) * 100)) : 0

  const handleQuickAdd = (value: number) => {
    setAmount((prev) => (typeof prev === "number" ? prev + value : value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || amount <= 0 || !name.trim()) return

    await addContribution.mutateAsync({
      contributorName: name.trim(),
      amount: Number(amount),
      currency: item.currency,
      message: message.trim() || undefined,
    })

    setAmount("")
    setMessage("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <div>
              <h2 className="text-lg font-black text-white">Сброситься на подарок</h2>
              <p className="text-xs text-zinc-400 line-clamp-1">{item.title}</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Progress Card */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  Собрано
                </span>
                <p className="text-xl font-black text-brand-400">
                  {formatPrice(totalContributed, item.currency)}
                </p>
              </div>
              {targetAmount > 0 && (
                <div className="text-right">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    Цель
                  </span>
                  <p className="text-sm font-bold text-zinc-300">
                    {formatPrice(targetAmount, item.currency)}
                  </p>
                </div>
              )}
            </div>

            {targetAmount > 0 && (
              <div>
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-zinc-400 mt-1">
                  <span>{percent}% выполнено</span>
                  <span>
                    Осталось{" "}
                    {formatPrice(Math.max(0, targetAmount - totalContributed), item.currency)}
                  </span>
                </div>
              </div>
            )}

            {item.fundraiserNote && (
              <p className="text-xs text-zinc-300 italic bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/50">
                💬 «{item.fundraiserNote}»
              </p>
            )}

            {item.fundraiserPaymentLink && (
              <a
                href={item.fundraiserPaymentLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 underline mt-1"
              >
                💳 Перевести организатору сбора ↗
              </a>
            )}
          </div>

          {/* Contribution Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-2xl"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Внести свою долю
            </h3>

            <div>
              <label
                htmlFor="contributor-name"
                className="block text-xs font-bold text-zinc-300 mb-1.5"
              >
                Ваше имя
              </label>
              <input
                id="contributor-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут?"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label
                htmlFor="contributor-amount"
                className="block text-xs font-bold text-zinc-300 mb-1.5"
              >
                Сумма взноса ({item.currency})
              </label>
              <input
                id="contributor-amount"
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                placeholder="500"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
              />

              {/* Quick Add Chips */}
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAdd(val)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="contributor-note"
                className="block text-xs font-bold text-zinc-300 mb-1.5"
              >
                Пожелание (опционально)
              </label>
              <input
                id="contributor-note"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="С днем рождения! 🎉"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={addContribution.isPending || !amount || !name.trim()}
              className="w-full py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
            >
              {addContribution.isPending ? "Сохраняем..." : "Зафиксировать взнос ✨"}
            </button>
          </form>

          {/* List of Contributors */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Участники ({contributionsData?.contributionCount ?? 0})
            </h3>

            {isLoading ? (
              <p className="text-xs text-zinc-500">Загрузка участников...</p>
            ) : !contributionsData?.contributions.length ? (
              <p className="text-xs text-zinc-500">Пока никто не скинулся. Будьте первыми! 🎁</p>
            ) : (
              <div className="space-y-2">
                {contributionsData.contributions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/40 rounded-xl text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{c.contributorName}</p>
                      {c.message && (
                        <p className="text-zinc-400 text-[11px] mt-0.5">💬 {c.message}</p>
                      )}
                    </div>
                    <span className="font-black text-brand-400 text-sm">
                      {formatPrice(c.amount, c.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
