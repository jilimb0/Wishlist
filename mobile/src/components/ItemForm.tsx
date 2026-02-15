import { Ionicons } from "@expo/vector-icons"
import * as Clipboard from "expo-clipboard"
import * as ImagePicker from "expo-image-picker"
import type React from "react"
import { useState } from "react"
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native"
import Toast from "react-native-toast-message"
import { useScrape, useUploadItemImage } from "../hooks/api"

interface ItemFormProps {
  initialData?: any
  onSubmit: (data: any) => void
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
  const [price, setPrice] = useState(initialData?.currentPrice?.toString() || "")
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
        // @ts-ignore
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
    onSubmit({
      url,
      title,
      description,
      imageUrl: imageUrl || imageUrlInput,
      currentPrice: price ? Number.parseFloat(price) : null,
      currency,
    })
  }

  return (
    <View style={styles.container}>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
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
  iconButton: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#27272a",
    borderRadius: 8,
    borderColor: "#3f3f46",
    borderWidth: 1,
  },
  scrapeButton: {
    marginTop: 8,
    backgroundColor: "#fbbf24",
    padding: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  scrapeButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 12,
  },
  imageOptionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orText: {
    color: "#71717a",
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#27272a",
    borderColor: "#3f3f46",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreview: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#27272a",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImage: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
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
