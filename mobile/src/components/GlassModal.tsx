import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import type React from "react"
import {
  Modal as RNModal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { fontSize, fontWeight, glass, spacing } from "../theme"

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <BlurView intensity={40} tint="dark" style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.glassContainer}>
              <BlurView intensity={60} tint="dark" style={styles.blur}>
                <View style={styles.innerContent}>
                  <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <View style={styles.closeButton}>
                        <Ionicons name="close" size={18} color="#a1a1aa" />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.body}>{children}</View>
                  {footer && <View style={styles.footer}>{footer}</View>}
                </View>
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        </BlurView>
      </TouchableWithoutFeedback>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: spacing["2xl"],
  },
  glassContainer: {
    borderRadius: spacing["2xl"],
    overflow: "hidden",
    borderWidth: 1,
    borderColor: glass.border.medium,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  blur: {
    overflow: "hidden",
  },
  innerContent: {
    backgroundColor: glass.background.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: glass.border.subtle,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: "#fff",
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: glass.border.light,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    padding: spacing.xl,
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: glass.border.subtle,
    backgroundColor: "rgba(39, 39, 42, 0.4)",
  },
})
