import { Input } from "@/components/Input"
import { useAuth } from "@/context/AuthContext"
import { useI18n } from "@/i18n/context"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { useEffect, useRef, useState } from "react"
import { useScrape, useUploadItemImage } from "../hooks/api"

interface WishlistFormProps {
  onSubmit: (data: {
    title: string
    type?: string
    firstWishTitle?: string
    description?: string
    emoji?: string
    privacy: string
  }) => void
  initial?: {
    title: string
    type?: string
    description?: string
    emoji?: string
    privacy: string
  }
  isLoading?: boolean
  mobileMode?: boolean
}

const PRESET_EMOJIS = [
  "🎁",
  "🎂",
  "📱",
  "👗",
  "🪁",
  "🏠",
  "✈️",
  "🎵",
  "💍",
  "🎨",
  "🧸",
  "👟",
  "🍕",
  "🎄",
  "⭐",
  "❤️",
  "🎉",
  "🛍️",
]

const PRIVACY_OPTIONS = [
  {
    value: "PRIVATE" as const,
    icon: "🔒",
    labelKey: "wishlist.private",
    descKey: "form.privacy_private_desc",
  },
  {
    value: "FRIENDS" as const,
    icon: "👥",
    labelKey: "wishlist.friends",
    descKey: "form.privacy_friends_desc",
  },
  {
    value: "PUBLIC" as const,
    icon: "🌍",
    labelKey: "wishlist.public",
    descKey: "form.privacy_public_desc",
  },
]

export function WishlistForm({ onSubmit, initial, isLoading, mobileMode }: WishlistFormProps) {
  const [title, setTitle] = useState(initial?.title || "")
  const [type, setType] = useState(initial?.type || "")
  const [firstWishTitle, setFirstWishTitle] = useState("")
  const [description, setDescription] = useState(initial?.description || "")
  const [emoji, setEmoji] = useState(initial?.emoji || "🎁")
  const [privacy, setPrivacy] = useState(initial?.privacy || "PRIVATE")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      type: type || undefined,
      firstWishTitle: firstWishTitle || undefined,
      description: description || undefined,
      emoji,
      privacy,
    })
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* ──── Mobile Form Layout ──── */
  if (mobileMode) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Emoji display + grid */}
        <div className="text-center">
          <span className="text-5xl block mb-2">{emoji}</span>
          <p className="text-xs text-zinc-500 mb-3">{t("form.choose_emoji")}</p>
          <div className="mobile-emoji-grid">
            {PRESET_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`mobile-emoji-btn ${emoji === e ? "mobile-emoji-btn--selected" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <label htmlFor="wishlist-title" className="block text-sm font-medium text-zinc-400 mb-2">
          {t("form.title")}
        </label>
        <Input
          id="wishlist-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("form.title_placeholder")}
          required
        />

        {/* Description */}
        <div>
          <label htmlFor="wishlist-type" className="block text-sm font-medium text-zinc-400 mb-2">
            Type (optional)
          </label>
          <Input
            id="wishlist-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Birthday, Home, Gifts..."
          />
        </div>

        <div>
          <label
            htmlFor="wishlist-first-wish"
            className="block text-sm font-medium text-zinc-400 mb-2"
          >
            First wish (optional)
          </label>
          <Input
            id="wishlist-first-wish"
            value={firstWishTitle}
            onChange={(e) => setFirstWishTitle(e.target.value)}
            placeholder="Add first wish title"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="wishlist-description"
            className="block text-sm font-medium text-zinc-400 mb-2"
          >
            {t("form.description_optional")}
          </label>
          <textarea
            id="wishlist-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("form.description_placeholder")}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none text-[15px]"
          />
        </div>

        {/* Privacy radio cards */}
        <div>
          <span className="block text-sm font-medium text-zinc-400 mb-3">{t("form.privacy")}</span>
          <div className="space-y-2">
            {PRIVACY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPrivacy(opt.value)}
                className={`mobile-privacy-option w-full ${privacy === opt.value ? "mobile-privacy-option--selected" : ""}`}
              >
                <div className="mobile-privacy-icon">{opt.icon}</div>
                <div className="mobile-privacy-text">
                  <h4>{t(opt.labelKey)}</h4>
                  <p>{t(opt.descKey)}</p>
                </div>
                <div className="mobile-privacy-radio">
                  <div className="mobile-privacy-radio-dot" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="w-full py-3.5 bg-zinc-800 text-zinc-300 font-semibold rounded-xl transition-colors disabled:opacity-40 text-[15px] active:scale-[0.98]"
          style={title.trim() ? { background: "#27272a", color: "#f5f5f5" } : {}}
        >
          {isLoading ? t("form.save") : initial ? t("form.update") : t("form.create")}
        </button>
      </form>
    )
  }

  /* ──── Desktop Form Layout (unchanged) ──── */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="item-title" className="block text-sm font-medium text-zinc-300 mb-1">
          {t("form.title")}
        </label>
        <div className="flex gap-2 relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-14 h-[42px] flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl text-2xl hover:border-brand-500/50 hover:bg-zinc-800 transition-all shadow-lg ring-1 ring-white/5 active:scale-95"
          >
            {emoji}
          </button>

          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute top-full left-0 z-50 mt-2">
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={(emojiData) => {
                  setEmoji(emojiData.emoji)
                  setShowEmojiPicker(false)
                }}
              />
            </div>
          )}

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My birthday wishlist"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="item-description" className="block text-sm font-medium text-zinc-300 mb-1">
          {t("form.description")}
        </label>
        <textarea
          id="item-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What's this list for?"
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none font-medium"
        />
      </div>

      <div>
        <label
          htmlFor="wishlist-type-desktop"
          className="block text-sm font-medium text-zinc-300 mb-1"
        >
          Type (optional)
        </label>
        <Input
          id="wishlist-type-desktop"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Birthday, Home, Gifts..."
        />
      </div>

      {!initial && (
        <div>
          <label
            htmlFor="wishlist-first-wish-desktop"
            className="block text-sm font-medium text-zinc-300 mb-1"
          >
            First wish (optional)
          </label>
          <Input
            id="wishlist-first-wish-desktop"
            value={firstWishTitle}
            onChange={(e) => setFirstWishTitle(e.target.value)}
            placeholder="Add first wish title"
          />
        </div>
      )}

      <div>
        <span className="block text-sm font-medium text-zinc-300 mb-1">{t("form.privacy")}</span>
        <div className="grid grid-cols-3 gap-3">
          {(["PRIVATE", "FRIENDS", "PUBLIC"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrivacy(p)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                privacy === p
                  ? "bg-brand-500 border-brand-400 text-black shadow-lg shadow-brand-500/20"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {p === "PRIVATE" ? "🔒 Private" : p === "FRIENDS" ? "👥 Friends" : "🌍 Public"}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !title.trim()}
        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/10 disabled:opacity-50"
      >
        {isLoading ? t("form.save") : initial ? t("form.update") : t("form.create")}
      </button>
    </form>
  )
}

// ─── Item Form ────────────────────────────────────────────

interface ItemFormProps {
  wishlistId: string
  onSubmit: (data: {
    wishlistId: string
    url: string
    title?: string
    imageUrl?: string
    price?: number
    status?: "ACTIVE" | "COMPLETED"
    trackPrice?: boolean
  }) => void
  initial?: {
    id: string
    url: string
    title: string
    imageUrl?: string
    currentPrice?: number
    currency?: string
    status?: "ACTIVE" | "COMPLETED"
    trackPrice?: boolean
  }
  isLoading?: boolean
}

export function ItemForm({ wishlistId, onSubmit, initial, isLoading }: ItemFormProps) {
  const [input, setInput] = useState(initial?.url || initial?.title || "")
  const [title, setTitle] = useState(initial?.title || "")
  const [url, setUrl] = useState(initial?.url || "")
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "")
  const [price, setPrice] = useState(initial?.currentPrice ? String(initial.currentPrice) : "")
  const [status, setStatus] = useState<"ACTIVE" | "COMPLETED">(initial?.status || "ACTIVE")
  const [trackPrice, setTrackPrice] = useState(initial?.trackPrice ?? false)
  const [isUrl, setIsUrl] = useState(initial?.url?.startsWith("http") || !!initial?.url || false)
  const { user } = useAuth()
  const [currency, _setCurrency] = useState(initial?.currency || user?.currency || "USD")
  const [manualMode, setManualMode] = useState(!!initial)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useI18n()

  const scrape = useScrape()
  const uploadImage = useUploadItemImage()

  const checkIsUrl = (val: string) => {
    if (val.startsWith("http://") || val.startsWith("https://")) return true
    // Basic domain check: word.tld (at least one dot, at least 2 chars after last dot)
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/
    return domainRegex.test(val)
  }

  const handleInputChange = async (val: string) => {
    setInput(val)
    const looksLikeUrl = checkIsUrl(val.trim())
    setIsUrl(looksLikeUrl)

    if (looksLikeUrl) {
      const fullUrl = val.trim().startsWith("http") ? val.trim() : `https://${val.trim()}`
      setUrl(fullUrl)
      scrape.mutate(fullUrl, {
        onSuccess: (data) => {
          if (data.title) setTitle(data.title)
          if (data.imageUrl) setImageUrl(data.imageUrl)
          if (data.price) setPrice(String(data.price))
        },
      })
    } else {
      setTitle(val)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadImage.mutate(file, {
        onSuccess: (data) => {
          setImageUrl(data.imageUrl)
        },
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalUrl = isUrl
      ? input.trim().startsWith("http")
        ? input.trim()
        : `https://${input.trim()}`
      : url

    onSubmit({
      wishlistId,
      url: finalUrl,
      title: isUrl ? title || input : input || title,
      imageUrl: imageUrl || undefined,
      price: price ? Number.parseFloat(price) : undefined,
      status,
      trackPrice,
    })

    if (!initial) {
      setInput("")
      setTitle("")
      setUrl("")
      setImageUrl("")
      setPrice("")
      setIsUrl(false)
      setManualMode(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="scraping-input" className="block text-sm font-medium text-zinc-300 mb-1">
          {isUrl ? t("form.item_url") : t("form.item_name")}
        </label>
        <Input
          id="scraping-input"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="e.g. Leather Jacket or https://amazon.com/..."
          required
          rightElement={
            scrape.isPending && (
              <div className="w-4 h-4 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            )
          }
        />
        {scrape.isPending && (
          <p className="text-xs text-brand-400 mt-1 animate-pulse">Fetching product info...</p>
        )}
      </div>

      {(isUrl || manualMode) && (
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div>
            <label htmlFor="manual-title" className="block text-sm font-medium text-zinc-300 mb-1">
              {isUrl ? t("form.title") : "Link (optional)"}
            </label>
            {isUrl ? (
              <Input
                id="manual-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Item name"
                required
              />
            ) : (
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            )}
          </div>

          <div>
            <label htmlFor="manual-price" className="block text-sm font-medium text-zinc-300 mb-1">
              {t("form.item_price")}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                {currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"}
              </span>
              <Input
                value={price}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "" || Number.parseFloat(val) >= 0) {
                    setPrice(val)
                  }
                }}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="manual-image" className="block text-sm font-medium text-zinc-300 mb-1">
              {t("form.item_image")}
            </label>
            <div className="flex gap-2">
              <Input
                id="manual-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                containerClassName="flex-1"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 border border-zinc-700/50"
                title="Upload Image"
              >
                {uploadImage.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "📁"
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {imageUrl && (
            <div className="mt-2 relative group w-20 h-20">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          )}

          <div>
            <label htmlFor="item-status" className="block text-sm font-medium text-zinc-300 mb-1">
              Status
            </label>
            <select
              id="item-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "ACTIVE" | "COMPLETED")}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brand-500/50"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={trackPrice}
              onChange={(e) => setTrackPrice(e.target.checked)}
              className="rounded border-zinc-600"
            />
            Track price changes
          </label>
        </div>
      )}

      {!isUrl && !manualMode && input.trim() && (
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          {t("form.add_more")}
        </button>
      )}

      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-brand-500/10 disabled:opacity-50 mt-2"
      >
        {isLoading ? t("form.save") : initial ? t("form.update_item") : t("form.add_to_wishlist")}
      </button>
    </form>
  )
}
