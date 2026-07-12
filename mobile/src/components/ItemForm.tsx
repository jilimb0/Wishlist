import { Ionicons } from "@expo/vector-icons"
import * as Clipboard from "expo-clipboard"
import * as ImagePicker from "expo-image-picker"
import type React from "react"
import { useState } from "react"
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native"
import Toast from "react-native-toast-message"
import { useScrape, useUploadItemImage } from "../hooks/api"
import { colors, fontSize, fontWeight, radius, spacing } from "../theme"

interface ItemFormData {
  url?: string
  title?: string
  description?: string
  imageUrl?: string
  price?: number
  currency?: string
}

interface ItemFormProps {
  initialData?: Partial<ItemFormData>
  onSubmit: (data: ItemFormData) => void
  isLoading: boolean
  submitLabel: string
}

export const ItemForm: React.FC<ItemFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
}) => {
  const [url, setUrl] = useState(initialData?.url || "")
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [price, setPrice] = useState(initialData?.price?.toString() || "")
  const [currency, setCurrency] = useState(initialData?.currency || "USD")
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")
  const [imageUrlInput, setImageUrlInput] = useState("")

  const scrapeMutation = useScrape()
  const uploadImageMutation = useUploadItemImage()

  // Auto-scrape when URL ends with valid domain and wasn't manually edited?
  // Easier: provide a "Auto-fill from URL" button

  const handleScrape = () => {
    if (!url) return
    scrapeMutation.mutate(url, {
      onSuccess: (data) => {
        if (data.title) setTitle(data.title)
        if (data.price) setPrice(data.price.toString())
        if (data.currency) setCurrency(data.currency)
        if (data.imageUrl) setImageUrl(data.imageUrl)
        if (data.description) setDescription(data.description)
        Vibration.vibrate(50)
      },
      onError: () => {
        Toast.show({
          type: "error",
          text1: "Failed to scrape details",
          text2: "Please fill in details manually",
        })
      },
    })
  }

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync()
    if (text) setUrl(text)
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      const asset = result.assets[0]
      // Upload immediately
      uploadImageMutation.mutate(
        // @ts-expect-error
        {
          uri: asset.uri,
          name: asset.fileName || "image.jpg",
          type: asset.mimeType || "image/jpeg",
        },
        {
          onSuccess: (data) => setImageUrl(data.imageUrl),
          onError: () => Toast.show({ type: "error", text1: "Upload failed" }),
        },
      )
    }
  }

  const handleSubmit = () => {
    const finalImageUrl = imageUrl || imageUrlInput
    onSubmit({
      url,
      title,
      description,
      ...(finalImageUrl ? { imageUrl: finalImageUrl } : {}),
      price: price ? Number.parseFloat(price) : undefined,
      currency,
    })
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* URL Input with Scrape Button */}
      <View style={styles.section}>
        <Text style={styles.label}>Product URL</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            placeholderTextColor="#71717a"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.iconButton} onPress={handlePaste}>
            <Ionicons name="clipboard-outline" size={20} color="#fbbf24" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.scrapeButton}
          onPress={handleScrape}
          disabled={!url || scrapeMutation.isPending}
        >
          {scrapeMutation.isPending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.scrapeButtonText}>Auto-fill from URL</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What is it?"
          placeholderTextColor="#71717a"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1, marginRight: 12 }]}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor="#71717a"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.section, { width: 100 }]}>
          <Text style={styles.label}>Currency</Text>
          <TextInput
            style={styles.input}
            value={currency}
            onChangeText={setCurrency}
            placeholder="USD"
            placeholderTextColor="#71717a"
            autoCapitalize="characters"
          />
        </View>
      </View>

      {/* Image Handling */}
      <View style={styles.section}>
        <Text style={styles.label}>Image</Text>

        {imageUrl ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImage} onPress={() => setImageUrl("")}>
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageOptionRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={imageUrlInput}
              onChangeText={setImageUrlInput}
              placeholder="Paste image URL..."
              placeholderTextColor="#71717a"
              autoCapitalize="none"
            />
            <Text style={styles.orText}>OR</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
              disabled={uploadImageMutation.isPending}
            >
              {uploadImageMutation.isPending ? (
                <ActivityIndicator size="small" color="#fbbf24" />
              ) : (
                <Ionicons name="image-outline" size={24} color="#fbbf24" />
              )}
            </TouchableOpacity>
          </View>
        )}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
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
  iconButton: {
    padding: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    borderColor: colors.border.secondary,
    borderWidth: 1,
  },
  scrapeButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent.primary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  scrapeButtonText: {
    color: "#000",
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  imageOptionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orText: {
    color: colors.text.quaternary,
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.secondary,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreview: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.background.tertiary,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImage: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: radius.lg,
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
