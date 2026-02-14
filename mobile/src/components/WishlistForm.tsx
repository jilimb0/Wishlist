import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { styles as theme } from "../theme" // We'll need a theme file or just inline styles
import { Ionicons } from "@expo/vector-icons"
import { Privacy } from "../types"

interface WishlistFormProps {
  initialData?: {
    id?: string
    title: string
    description?: string | null
    emoji: string
    privacy: Privacy | string
  }
  onSubmit: (data: any) => void
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
  // @ts-ignore
  const [privacy, setPrivacy] = useState<Privacy>(
    initialData?.privacy || Privacy.PUBLIC,
  )
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
    <View style={styles.container}>
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
                  style={[
                    styles.emojiOption,
                    emoji === e && styles.emojiOptionSelected,
                  ]}
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
              style={[
                styles.privacyOption,
                privacy === option.id && styles.privacyOptionSelected,
              ]}
              onPress={() => setPrivacy(option.id as Privacy)}
            >
              <View
                style={[
                  styles.privacyIcon,
                  privacy === option.id && styles.privacyIconSelected,
                ]}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={privacy === option.id ? "#fbbf24" : "#71717a"}
                />
              </View>
              <View style={styles.privacyText}>
                <Text style={styles.privacyLabel}>{option.label}</Text>
                <Text style={styles.privacyDescription}>
                  {option.description}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  privacy === option.id && styles.radioSelected,
                ]}
              >
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#d4d4d8",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    padding: 12,
    color: "#ffffff",
    fontSize: 16,
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
    borderRadius: 12,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiText: {
    fontSize: 32,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#27272a",
  },
  emojiOptionSelected: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  emojiOptionText: {
    fontSize: 24,
  },
  privacyContainer: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272a",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  privacyOptionSelected: {
    borderColor: "#fbbf24",
    backgroundColor: "rgba(251, 191, 36, 0.05)",
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#3f3f46",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  privacyIconSelected: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  privacyText: {
    flex: 1,
  },
  privacyLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  privacyDescription: {
    color: "#71717a",
    fontSize: 13,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#52525b",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#fbbf24",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fbbf24",
  },
  button: {
    backgroundColor: "#fbbf24",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
  },
})
