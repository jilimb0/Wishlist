import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useState } from "react"
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { colors, fontSize, fontWeight, radius, spacing } from "../theme"
import { Privacy } from "../types"

interface WishlistFormData {
  title?: string
  description?: string
  emoji?: string
  privacy?: Privacy | string
}

interface WishlistFormProps {
  initialData?: {
    id?: string
    title: string
    description?: string | null
    emoji: string
    privacy: Privacy | string
  }
  onSubmit: (data: WishlistFormData) => void
  isLoading: boolean
  submitLabel: string
}

const EMOJI_OPTIONS = [
  "🎁",
  "🎂",
  "🎄",
  "🏠",
  "✈️",
  "🎮",
  "📚",
  "👗",
  "👟",
  "🎨",
  "🎵",
  "📷",
  "💍",
  "👶",
  "🚗",
  "💼",
  "🍳",
  "💪",
  "🎓",
  "🐶",
]

export const WishlistForm: React.FC<WishlistFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
}) => {
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [emoji, setEmoji] = useState(initialData?.emoji || "🎁")
  // @ts-expect-error
  const [privacy, setPrivacy] = useState<Privacy>(initialData?.privacy || Privacy.PUBLIC)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const privacyOptions = [
    {
      id: Privacy.PUBLIC,
      label: "Everyone",
      description: "Anyone can see this list",
      icon: "globe-outline",
    },
    {
      id: Privacy.FRIENDS,
      label: "Friends only",
      description: "Only your friends can see this",
      icon: "people-outline",
    },
    {
      id: Privacy.PRIVATE,
      label: "Only you",
      description: "Visible only to you",
      icon: "lock-closed-outline",
    },
  ]

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      emoji,
      privacy,
    })
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Emoji Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>Choose an emoji</Text>
        <View style={styles.emojiRow}>
          <TouchableOpacity
            style={styles.selectedEmoji}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>

          {showEmojiPicker && (
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiOption, emoji === e && styles.emojiOptionSelected]}
                  onPress={() => {
                    setEmoji(e)
                    setShowEmojiPicker(false)
                  }}
                >
                  <Text style={styles.emojiOptionText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Birthday Wishlist"
          placeholderTextColor="#71717a"
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="What's this wishlist for?"
          placeholderTextColor="#71717a"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.label}>Privacy</Text>
        <View style={styles.privacyContainer}>
          {privacyOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.privacyOption, privacy === option.id && styles.privacyOptionSelected]}
              onPress={() => setPrivacy(option.id as Privacy)}
            >
              <View
                style={[styles.privacyIcon, privacy === option.id && styles.privacyIconSelected]}
              >
                <Ionicons
                  name={option.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={privacy === option.id ? "#fbbf24" : "#71717a"}
                />
              </View>
              <View style={styles.privacyText}>
                <Text style={styles.privacyLabel}>{option.label}</Text>
                <Text style={styles.privacyDescription}>{option.description}</Text>
              </View>
              <View style={[styles.radio, privacy === option.id && styles.radioSelected]}>
                {privacy === option.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["4xl"],
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.md,
  },
  textArea: {
    height: 80,
  },
  emojiRow: {
    alignItems: "flex-start",
  },
  selectedEmoji: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: {
    fontSize: fontSize["3xl"],
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
  },
  emojiOptionSelected: {
    backgroundColor: colors.accent.secondary,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  emojiOptionText: {
    fontSize: fontSize["2xl"],
  },
  privacyContainer: {
    gap: spacing.md,
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  privacyOptionSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.secondary,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.border.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  privacyIconSelected: {
    backgroundColor: colors.accent.secondary,
  },
  privacyText: {
    flex: 1,
  },
  privacyLabel: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  privacyDescription: {
    color: colors.text.quaternary,
    fontSize: fontSize.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.tertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: colors.accent.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.primary,
  },
  button: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#000000",
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
  },
})
