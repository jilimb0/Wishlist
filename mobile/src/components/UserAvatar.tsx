import React from "react"
import { View, Text, Image, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

interface UserAvatarProps {
  user?: {
    displayName: string
    avatarUrl?: string | null
  } | null
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  className?: string // kept for compatibility if needed, but not used with StyleSheet
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
}) => {
  const getInitials = (name: string) => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  const initials = getInitials(user?.displayName || "User")

  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 12 },
    md: { width: 40, height: 40, fontSize: 14 },
    lg: { width: 64, height: 64, fontSize: 24 },
    xl: { width: 80, height: 80, fontSize: 30 },
    "2xl": { width: 128, height: 128, fontSize: 48 },
  }

  const { width, height, fontSize } = sizeStyles[size]

  if (user?.avatarUrl) {
    return (
      <Image
        source={{ uri: user.avatarUrl }}
        style={[styles.avatar, { width, height }]}
      />
    )
  }

  return (
    <LinearGradient
      colors={["#fbbf24", "#d97706"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width, height }]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  avatar: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  initials: {
    color: "#000",
    fontWeight: "bold",
  },
})
