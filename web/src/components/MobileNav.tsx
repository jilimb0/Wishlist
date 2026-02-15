import { useI18n } from "@/i18n/context"
import { Link, useLocation } from "react-router-dom"

const tabs = [
  { path: "/", icon: "home", labelKey: "nav.my_lists" },
  { path: "/discover", icon: "discover", labelKey: "nav.discover" },
  { path: "/following", icon: "following", labelKey: "nav.following" },
  { path: "/profile", icon: "profile", labelKey: "nav.profile" },
] as const

function TabIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? "#FFC107" : "#71717a"

  switch (type) {
    case "home":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>home</title>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={active ? color : "none"} />
          <polyline points="9 22 9 12 15 12 15 22" stroke={active ? "#0a0a0a" : color} />
        </svg>
      )
    case "discover":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>discover</title>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    case "following":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={active ? color : "none"}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>following</title>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case "profile":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>profile</title>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    default:
      return null
  }
}

export function MobileNav() {
  const location = useLocation()
  const { t } = useI18n()

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="mobile-nav">
      {tabs.map((tab) => {
        const active = isActive(tab.path)
        return (
          <Link key={tab.path} to={tab.path} className="mobile-nav-tab">
            <TabIcon type={tab.icon} active={active} />
            <span className={`mobile-nav-label ${active ? "mobile-nav-label--active" : ""}`}>
              {t(tab.labelKey)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
