import { Link, useLocation } from "react-router-dom"

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
    case "lists":
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
          <title>lists</title>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="7" y1="9" x2="17" y2="9" />
          <line x1="7" y1="13" x2="14" y2="13" />
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
  const lastActiveWishlistId = localStorage.getItem("lastActiveWishlistId")
  const mainPath = lastActiveWishlistId ? `/wishlists/${lastActiveWishlistId}` : "/"
  const tabs = [
    { path: mainPath, icon: "home", label: "Main" },
    { path: "/lists", icon: "lists", label: "Lists" },
    { path: "/profile", icon: "profile", label: "Profile" },
  ] as const

  const isActive = (path: string) => {
    if (path.startsWith("/wishlists/")) return location.pathname.startsWith("/wishlists/")
    if (path === "/lists") return location.pathname === "/lists"
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
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
