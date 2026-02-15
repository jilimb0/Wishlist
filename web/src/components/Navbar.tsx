import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useNotifications, useUpdateProfile } from "../hooks/api"
import { useI18n } from "../i18n/context"
import { CustomSelect } from "./CustomSelect"
import { NotificationCenter } from "./NotificationCenter"
import { UserAvatar } from "./UserAvatar"

export function Navbar() {
  const { user, logout, updateUser } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const updateProfile = useUpdateProfile()
  const { data } = useNotifications(10)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const unreadCount = data?.notifications?.filter((n) => !n.isRead).length || 0

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-brand-400 border-b-2 border-brand-400"
      : "text-zinc-400 hover:text-white"

  const handleSettingChange = (field: "language" | "currency", value: string) => {
    updateProfile.mutate(
      { [field]: value },
      {
        onSuccess: (updatedUser) => {
          updateUser(updatedUser)
          toast.success(`${t("common.loading")}`) // Simplified
        },
      },
    )
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/70 backdrop-blur-xl saturate-150 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-95 shrink-0"
          >
            <span className="text-2xl drop-shadow-sm group-hover:rotate-12 transition-transform">
              🎁
            </span>
            <span className="bg-linear-to-br from-brand-300 via-brand-500 to-brand-600 bg-clip-text text-transparent hidden sm:inline font-extrabold tracking-tight">
              WishTracker
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
            <Link to="/" className={`pb-0.5 transition-colors shrink-0 ${isActive("/")}`}>
              {t("nav.my_lists")}
            </Link>
            <Link
              to="/following"
              className={`pb-0.5 transition-colors shrink-0 ${isActive("/following")}`}
            >
              {t("nav.following")}
            </Link>
            <Link
              to="/discover"
              className={`pb-0.5 transition-colors shrink-0 ${isActive("/discover")}`}
            >
              {t("nav.discover")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <CustomSelect
              value={user.language || "en"}
              onChange={(val) => handleSettingChange("language", val)}
              options={[
                { id: "en", label: "EN", value: "en" },
                { id: "ru", label: "RU", value: "ru" },
              ]}
            />

            <CustomSelect
              value={user.currency || "USD"}
              onChange={(val) => handleSettingChange("currency", val)}
              options={[
                { id: "usd", label: "USD", value: "USD", icon: "$" },
                { id: "eur", label: "EUR", value: "EUR", icon: "€" },
                { id: "rub", label: "RUB", value: "RUB", icon: "₽" },
              ]}
            />
          </div>

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800/50 border border-zinc-700/30 hover:bg-zinc-800 hover:border-zinc-700 transition-all group relative active:scale-95"
            >
              <span className="text-lg group-hover:rotate-12 transition-transform">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-zinc-900 animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            )}
          </div>

          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 h-10 rounded-xl transition-all active:scale-95 group"
          >
            <UserAvatar
              user={user}
              size="sm"
              className="group-hover:ring-1 ring-brand-500/50 transition-all"
            />
            <span className="hidden lg:block text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors max-w-[100px] truncate">
              {user.displayName}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => {
              logout()
              navigate("/login")
            }}
            className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all active:scale-95 hidden sm:block"
          >
            {t("nav.logout")}
          </button>
        </div>
      </div>
    </header>
  )
}
