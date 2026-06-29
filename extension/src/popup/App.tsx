import type { Wishlist } from "@wishtracker/shared"
import { useEffect, useState } from "react"

interface ScrapedData {
  title: string
  description?: string
  image?: string
  url: string
  price?: number
  currency?: string
}

const API_Base = `${import.meta.env.VITE_API_URL || "http://localhost:3010"}/api`

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [selectedList, setSelectedList] = useState("")
  const [meta, setMeta] = useState<ScrapedData | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // 1. Check for token in storage (or sync from web app logic if we had cookie auth,
  // but we use localStorage token, so user needs to login in extension separately
  // OR we can try to message the web app if open. For MVP: separate login/token input)
  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchWishlists is stable (defined once via useCallback)
  useEffect(() => {
    chrome.storage.local.get(["token"], (result: { token?: string }) => {
      if (result.token) {
        setToken(result.token)
        fetchWishlists(result.token)
      } else {
        setLoading(false)
      }
    })

    // Scrape current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      if (activeTab?.id) {
        chrome.tabs.sendMessage(
          activeTab.id,
          { action: "scrape" },
          (response: ScrapedData | null) => {
            if (response) setMeta(response)
          },
        )
      }
    })
  }, [])

  const fetchWishlists = async (authToken: string) => {
    try {
      const res = await fetch(`${API_Base}/wishlists`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        setWishlists(data)
        if (data.length > 0) setSelectedList(data[0].id)
        setLoading(false)
      } else {
        setToken(null)
        chrome.storage.local.remove("token")
        setLoading(false)
      }
    } catch (_e) {
      setError("Connection error")
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email")
    const password = formData.get("password")

    try {
      const res = await fetch(`${API_Base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.ok) {
        setToken(data.token)
        chrome.storage.local.set({ token: data.token })
        fetchWishlists(data.token)
      } else {
        setError(data.message || "Login failed")
        setLoading(false)
      }
    } catch (_e) {
      setError("Network error")
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!meta || !selectedList) return
    setLoading(true)

    try {
      const res = await fetch(`${API_Base}/wishlists/${selectedList}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: meta.url,
          title: meta.title,
          imageUrl: meta.image,
          price: meta.price,
          currency: meta.currency,
          description: meta.description,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => window.close(), 1500)
      } else {
        const err = await res.json()
        setError(err.message)
      }
    } catch (_e) {
      setError("Failed to add item")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !meta) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 p-8">
        <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-zinc-500">Connecting...</p>
      </div>
    )
  }

  // Login Screen
  if (!token) {
    return (
      <div className="h-screen flex flex-col bg-zinc-950">
        <div className="flex-1 flex flex-col p-8 items-center justify-center">
          <div className="text-4xl mb-6 animate-bounce">🎁</div>
          <h1 className="text-2xl font-black mb-1 bg-linear-to-br from-brand-300 via-brand-500 to-brand-600 bg-clip-text text-transparent tracking-tight">
            WishTracker
          </h1>
          <p className="text-xs text-zinc-500 font-medium mb-8 text-center">
            Sign in to start adding items to your wishlists
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-1.5">
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all font-medium"
              />
            </div>
            {error && (
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-br from-brand-400 to-brand-600 text-black font-black py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? "AUTHENTICATING..." : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Success Screen
  if (success) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl text-brand-500">✓</span>
        </div>
        <h2 className="text-xl font-black text-white mb-2 tracking-tight">ITEM ADDED!</h2>
        <p className="text-sm text-zinc-500 font-medium">Closing in a few seconds...</p>
      </div>
    )
  }

  // Add Item Screen
  return (
    <div className="h-screen flex flex-col bg-zinc-950 font-sans">
      <header className="p-4 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <span className="font-black text-xs tracking-widest text-zinc-500 uppercase">
              WishTracker
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              chrome.storage.local.remove(["token"], () => {
                setToken(null)
              })
            }}
            className="text-[10px] uppercase tracking-widest font-black text-zinc-600 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-3">
          {meta ? (
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden mb-4 shadow-xl">
              {meta.image ? (
                <div className="aspect-4/3 relative bg-zinc-900">
                  <img
                    src={meta.image}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="aspect-4/3 bg-zinc-900 flex items-center justify-center">
                  <span className="text-3xl opacity-20">🖼️</span>
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-base text-white leading-tight mb-2 line-clamp-2">
                  {meta.title}
                </h2>
                {meta.price && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-brand-500 font-black text-lg">{meta.price}</span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase">
                      {meta.currency || "USD"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl mb-4 text-center">
              <span className="text-2xl block mb-2 opacity-20">🔍</span>
              <p className="text-xs text-zinc-500 font-medium italic">Scanning page details...</p>
            </div>
          )}

          <div className="space-y-4 px-1">
            <div className="space-y-1.5">
              <label
                htmlFor="wishlist-select"
                className="text-[10px] uppercase tracking-widest font-black text-zinc-600 ml-1"
              >
                Select Wishlist
              </label>
              <div className="relative">
                <select
                  id="wishlist-select"
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="w-full bg-zinc-800 text-white rounded-lg p-3 pr-10 appearance-none outline-hidden focus:ring-2 focus:ring-brand-400 border border-zinc-700 font-medium"
                >
                  {wishlists.map((wl) => (
                    <option key={wl.id} value={wl.id}>
                      {wl.emoji} {wl.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  ▼
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={loading || !selectedList}
              className="w-full bg-linear-to-br from-brand-400 to-brand-600 text-black font-black py-4 rounded-xl hover:shadow-[0_0_30px_rgba(255,193,7,0.4)] transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-2xl relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "ADDING..." : "ADD TO WISHLIST"}
                {!loading && <span className="text-lg">✨</span>}
              </span>
            </button>

            {error && (
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">
                {error}
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="p-3 border-t border-zinc-900 bg-zinc-950/50 text-center">
        <p className="text-[10px] text-zinc-600 font-medium">WishTracker Extension v1.2.0 • 🎁</p>
      </footer>
    </div>
  )
}
