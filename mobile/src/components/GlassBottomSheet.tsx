import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import type React from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { fontSize, fontWeight, glass, radius, spacing } from "../theme"

interface GlassBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export const GlassBottomSheet: React.FC<GlassBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <RNModal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <BlurView intensity={30} tint="dark" style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          <BlurView intensity={80} tint="dark" style={styles.sheet}>
            <View style={styles.innerSheet}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />
              </View>

              {title && (
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
              )}

              <View style={styles.body}>{children}</View>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: glass.background.overlay,
  },
  sheetContainer: {
    borderTopLeftRadius: spacing["2xl"],
    borderTopRightRadius: spacing["2xl"],
    overflow: "hidden",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: glass.border.medium,
    maxHeight: "92%",
  },
  sheet: {
    overflow: "hidden",
  },
  innerSheet: {
    backgroundColor: glass.background.primary,
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: glass.handle,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
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
    maxHeight: "89%",
  },
})
