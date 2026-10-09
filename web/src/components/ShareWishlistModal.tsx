import { useState } from "react"
import type { Wishlist } from "@/types"

interface ShareWishlistModalProps {
  isOpen: boolean
  onClose: () => void
  wishlist: Wishlist
}

export function ShareWishlistModal({ isOpen, onClose, wishlist }: ShareWishlistModalProps) {
  const [copied, setCopied] = useState(false)
  const [preset, setPreset] = useState<"bday" | "newyear" | "general">("bday")

  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/wishlist/${wishlist.id}`

  const messageTemplates = {
    bday: `🎂 Мой список желаний ко дню рождения: «${wishlist.title}»! Посмотрите, что мне можно подарить:`,
    newyear: `🎄 Мой праздничный вишлист: «${wishlist.title}»! Загляните выбрать подарок:`,
    general: `🎁 Мой список желаний: «${wishlist.title}»! Смотрите на WishTracker:`,
  }

  const currentText = messageTemplates[preset]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${currentText}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: wishlist.title,
          text: currentText,
          url: shareUrl,
        })
      } catch {
        // cancelled
      }
    } else {
      handleCopy()
    }
  }

  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(currentText)}`
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${currentText} ${shareUrl}`)}`
  const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(wishlist.title)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{wishlist.emoji || "🎁"}</span>
            <div>
              <h2 className="text-lg font-black text-white">Поделиться вишлистом</h2>
              <p className="text-xs text-zinc-400">Отправьте друзьям в соцсетях</p>
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

        {/* Occasion Switcher */}
        <div>
          <div className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Повод для подарков
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPreset("bday")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                preset === "bday"
                  ? "bg-brand-500/10 border-brand-500 text-brand-400"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🎂 День рождения
            </button>
            <button
              type="button"
              onClick={() => setPreset("newyear")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                preset === "newyear"
                  ? "bg-brand-500/10 border-brand-500 text-brand-400"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🎄 Новый год
            </button>
            <button
              type="button"
              onClick={() => setPreset("general")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                preset === "general"
                  ? "bg-brand-500/10 border-brand-500 text-brand-400"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🎁 Просто так
            </button>
          </div>
        </div>

        {/* Preview message */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 text-xs text-zinc-300">
          <p className="font-medium">{currentText}</p>
          <p className="font-bold text-brand-400 mt-1 break-all">{shareUrl}</p>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href={tgUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-2xl text-sky-400 transition-all hover:scale-105"
          >
            <span className="text-2xl mb-1">✈️</span>
            <span className="text-[11px] font-bold">Telegram</span>
          </a>

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 transition-all hover:scale-105"
          >
            <span className="text-2xl mb-1">💬</span>
            <span className="text-[11px] font-bold">WhatsApp</span>
          </a>

          <a
            href={vkUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-2xl text-blue-400 transition-all hover:scale-105"
          >
            <span className="text-2xl mb-1">🔵</span>
            <span className="text-[11px] font-bold">ВКонтакте</span>
          </a>
        </div>

        {/* Action Button: Copy link or Native Share */}
        <div className="flex gap-2">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Поделиться 📲
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-3 bg-brand-500 hover:bg-brand-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
          >
            {copied ? "Ссылка скопирована! ✅" : "Скопировать ссылку 📋"}
          </button>
        </div>
      </div>
    </div>
  )
}
