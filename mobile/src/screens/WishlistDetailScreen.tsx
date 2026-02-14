import React, { useState, useLayoutEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Linking,
  Share,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../context/AuthContext"
import { useI18n } from "../i18n/context"
import {
  useWishlist,
  useAddItem,
  useDeleteItem,
  useUpdateItem,
  useReserveItem,
  useCancelReservation,
  useDeleteWishlist,
} from "../hooks/api"
import { Item, Wishlist } from "../types"
import { BottomSheet } from "../components/BottomSheet"
import { ItemForm } from "../components/ItemForm"
import { WishlistForm } from "../components/WishlistForm"
import { Modal } from "../components/Modal"
import Toast from "react-native-toast-message"
import * as Clipboard from "expo-clipboard"

export default function WishlistDetailScreen() {
  const { params } = useRoute<any>()
  // @ts-ignore
  const { wishlistId } = params
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const { formatPrice } = useI18n()

  const { data: wishlist, isLoading, refetch } = useWishlist(wishlistId)

  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditWishlistOpen, setIsEditWishlistOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const addItemMutation = useAddItem()
  const deleteItemMutation = useDeleteItem()
  const deleteWishlistMutation = useDeleteWishlist()
  const reserveMutation = useReserveItem()
  const cancelReservationMutation = useCancelReservation()

  const isOwner = user?.id === wishlist?.userId

  useLayoutEffect(() => {
    navigation.setOptions({
      title: wishlist?.title || "Wishlist",
      headerRight: () =>
        isOwner ? (
          <TouchableOpacity onPress={() => setIsEditWishlistOpen(true)}>
            <Ionicons name="settings-outline" size={24} color="#fbbf24" />
          </TouchableOpacity>
        ) : null,
    })
  }, [navigation, wishlist, isOwner])

  const handleAddItem = (data: any) => {
    addItemMutation.mutate(
      { wishlistId, ...data },
      {
        onSuccess: () => {
          setIsAddItemOpen(false)
          Toast.show({ type: "success", text1: "Item added" })
        },
        onError: (err: any) =>
          Toast.show({ type: "error", text1: err.message }),
      },
    )
  }

  const handleDeleteItem = () => {
    if (!itemToDelete) return
    deleteItemMutation.mutate(itemToDelete, {
      onSuccess: () => {
        setItemToDelete(null)
        Toast.show({ type: "success", text1: "Item removed" })
      },
    })
  }

  const handleShare = async () => {
    const url = `https://wishtracker.app/wishlists/${wishlistId}`
    await Share.share({
      message: `Check out my wishlist: ${wishlist?.title}\n${url}`,
      url,
    })
  }

  const renderItem = ({ item }: { item: Item }) => {
    const isReserved = item.reservation?.status === "ACTIVE"
    const reservedByMe = item.reservation?.userId === user?.id

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => Linking.openURL(item.url)}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="gift-outline" size={32} color="#71717a" />
            </View>
          )}
          {isReserved && (
            <View style={styles.reservedBadge}>
              <Text style={styles.reservedText}>RESERVED</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title || "Untitled Item"}
          </Text>

          {item.currentPrice && (
            <Text style={styles.itemPrice}>
              {formatPrice(item.currentPrice, item.currency)}
            </Text>
          )}

          <View style={styles.actions}>
            {isOwner ? (
              <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => setItemToDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.reserveButton,
                  isReserved && !reservedByMe && styles.reserveButtonDisabled,
                  reservedByMe && styles.reserveButtonActive,
                ]}
                disabled={isReserved && !reservedByMe}
                onPress={() => {
                  if (reservedByMe) {
                    cancelReservationMutation.mutate(item.reservation!.id)
                  } else {
                    reserveMutation.mutate({ itemId: item.id })
                  }
                }}
              >
                <Text
                  style={[
                    styles.reserveButtonText,
                    reservedByMe && styles.reserveButtonTextActive,
                  ]}
                >
                  {reservedByMe ? "Reserved" : isReserved ? "Taken" : "Reserve"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => Linking.openURL(item.url)}
            >
              <Ionicons name="open-outline" size={20} color="#fbbf24" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  const ListHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.emoji}>{wishlist?.emoji}</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#fbbf24" />
          <Text style={styles.shareText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{wishlist?.title}</Text>
      {wishlist?.description && (
        <Text style={styles.description}>{wishlist.description}</Text>
      )}

      <View style={styles.privacyRow}>
        <Ionicons name="lock-closed-outline" size={14} color="#71717a" />
        <Text style={styles.privacyText}>
          {wishlist?.privacy === "PUBLIC"
            ? "Public"
            : wishlist?.privacy === "FRIENDS"
              ? "Friends Only"
              : "Private"}
        </Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar style="light" />

      <FlatList
        data={wishlist?.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#fbbf24"
          />
        }
      />

      {isOwner && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsAddItemOpen(true)}
        >
          <Ionicons name="add" size={32} color="#000" />
        </TouchableOpacity>
      )}

      {/* Add Item Sheet */}
      <BottomSheet
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title="Add Item"
      >
        <ItemForm
          onSubmit={handleAddItem}
          isLoading={addItemMutation.isPending}
          submitLabel="Add to Wishlist"
        />
      </BottomSheet>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Remove Item"
        footer={
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setItemToDelete(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteItem}
              disabled={deleteItemMutation.isPending}
            >
              <Text style={styles.deleteButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.modalText}>
          Are you sure you want to remove this item?
        </Text>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 48,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  shareText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#d4d4d8",
    marginBottom: 12,
    lineHeight: 22,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  privacyText: {
    fontSize: 12,
    color: "#71717a",
  },
  // Item Card
  card: {
    flex: 1,
    backgroundColor: "#18181b",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderColor: "#27272a",
    borderWidth: 1,
    maxWidth: "48%", // 2 columns with gap
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#27272a",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  reservedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reservedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
    height: 40,
  },
  itemPrice: {
    fontSize: 14,
    color: "#fbbf24",
    fontWeight: "bold",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  deleteAction: {
    padding: 4,
  },
  linkButton: {
    padding: 4,
  },
  reserveButton: {
    backgroundColor: "#27272a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  reserveButtonActive: {
    backgroundColor: "#fbbf24",
  },
  reserveButtonDisabled: {
    opacity: 0.5,
  },
  reserveButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  reserveButtonTextActive: {
    color: "#000",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fbbf24",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // Modal
  modalFooter: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#27272a",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalText: {
    color: "#d4d4d8",
    fontSize: 16,
    lineHeight: 24,
  },
})
