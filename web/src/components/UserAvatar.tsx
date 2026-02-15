import type React from "react"

interface UserAvatarProps {
  user?: {
    displayName: string
    avatarUrl?: string | null
  } | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-20 h-20 text-2xl",
  }

  const getInitials = (name: string) => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  const initials = getInitials(user?.displayName || "User")

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.displayName}
        className={`${sizeClasses[size]} rounded-full object-cover border border-zinc-700 ${className}`}
      />
    )
  }

  // Consistent stylized placeholder
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-black font-bold border border-zinc-700 ${className}`}
    >
      {initials}
    </div>
  )
}
