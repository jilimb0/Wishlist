import { BlurView } from "expo-blur"
import type React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { glass, spacing } from "../theme"

interface GlassCardProps {
  children: React.ReactNode
  style?: ViewStyle
  intensity?: number
  tint?: "dark" | "light" | "default"
  noPadding?: boolean
  noBorder?: boolean
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 40,
  tint = "dark",
  noPadding = false,
  // noBorder = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blur}>
        <View style={[styles.inner, noPadding && { padding: 0 }]}>{children}</View>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.xl,
    borderWidth: 1,
    borderColor: glass.border.light,

    overflow: "hidden",
    shadowColor: "rgba(251, 191, 36, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  blur: {
    overflow: "hidden",
  },
  inner: {
    padding: spacing.lg,
    backgroundColor: glass.background.secondary,
  },
})
