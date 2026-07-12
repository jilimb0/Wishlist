import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "expo-status-bar"
import React, { useLayoutEffect, useState } from "react"
import {
  Alert,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { GlassBottomSheet } from "../components/GlassBottomSheet"
import { GlassCard } from "../components/GlassCard"
import { GlassModal } from "../components/GlassModal"
import { ItemForm } from "../components/ItemForm"
import { PriceHistoryList } from "../components/PriceHistoryList"
import { UserAvatar } from "../components/UserAvatar"
import { WishlistForm } from "../components/WishlistForm"
import { useAuth } from "../context/AuthContext"
import {
  useAddItem,
  useCancelReservation,
  useDeleteItem,
  useDeleteWishlist,
  useReserveItem,
  useSubscribeToWishlist,
  useUnsubscribeFromWishlist,
  useUpdateWishlist,
  useWishlist,
} from "../hooks/api"
import { useI18n } from "../i18n/context"
import { colors, fontSize, fontWeight, radius, spacing } from "../theme"
import type { Item } from "../types"

export default function WishlistDetailScreen() {
  const { params } = useRoute()
  const { wishlistId } = params
  const { user } = useAuth()
  const navigation = useNavigation()
  const { formatPrice, t } = useI18n()

  const { data: wishlist, isLoading, refetch } = useWishlist(wishlistId)

  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditWishlistOpen, setIsEditWishlistOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const addItemMutation = useAddItem()
  const deleteItemMutation = useDeleteItem()
  const deleteWishlistMutation = useDeleteWishlist()
  const updateWishlistMutation = useUpdateWishlist()
  const reserveMutation = useReserveItem()
  const cancelReservationMutation = useCancelReservation()
  const subscribeMutation = useSubscribeToWishlist()
  const unsubscribeMutation = useUnsubscribeFromWishlist()

  const isOwner = user?.id === wishlist?.userId
  const userSubscription = wishlist?.subscriptions?.find(
    (sub: Record<string, unknown>) => sub.userId === user?.id,
  )
  const isSubscribed = !!userSubscription

  const getPrivacyIcon = React.useCallback((privacy: string) => {
    switch (privacy) {
      case "PUBLIC":
        return "earth-outline"
      case "FRIENDS":
        return "people-outline"
      default:
        return "lock-closed-outline"
    }
  }, [])

  const handleSubscriptionToggle = React.useCallback(() => {
    if (isSubscribed && userSubscription) {
      unsubscribeMutation.mutate(userSubscription.id)
    } else {
      subscribeMutation.mutate(wishlistId)
    }
  }, [isSubscribed, userSubscription, unsubscribeMutation, subscribeMutation, wishlistId])

  const handleShare = React.useCallback(async () => {
    if (!wishlist) return
    const url = `https://wishtracker.app/wishlists/${wishlistId}`
    try {
      await Share.share({
        message: `Check out my wishlist: ${wishlist.title}\n${url}`,
        url,
      })
    } catch (error) {
      console.error(error)
    }
  }, [wishlist, wishlistId])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff" }}>
            {wishlist ? `${wishlist.emoji} ${wishlist.title}` : t("nav.my_lists")}
          </Text>
          {wishlist && (
            <Ionicons
              name={getPrivacyIcon(wishlist.privacy)}
              size={16}
              color="rgba(255,255,255,0.4)"
            />
          )}
        </View>
      ),
      headerTransparent: true,
      headerBlurEffect: "dark",
      headerStyle: {
        backgroundColor: "rgba(10, 10, 10, 0.8)",
      },
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 16, marginRight: 8 }}>
          {!isOwner && (
            <TouchableOpacity onPress={handleSubscriptionToggle}>
              <Ionicons
                name={isSubscribed ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#fbbf24"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#fbbf24" />
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity onPress={() => setIsEditWishlistOpen(true)}>
              <Ionicons name="settings-outline" size={24} color="#fbbf24" />
            </TouchableOpacity>
          )}
        </View>
      ),
    })
  }, [
    navigation,
    wishlist,
    isOwner,
    isSubscribed,
    handleSubscriptionToggle,
    getPrivacyIcon,
    handleShare,
    t,
  ])

  const handleAddItem = (data: Record<string, unknown>) => {
    addItemMutation.mutate(
      { wishlistId, ...data },
      {
        onSuccess: () => {
          setIsAddItemOpen(false)
          Toast.show({ type: "success", text1: t("wishlist.item_added") })
        },
        onError: (err: Error) => Toast.show({ type: "error", text1: err.message }),
      },
    )
  }

  const handleUpdateWishlist = (data: Record<string, unknown>) => {
    updateWishlistMutation.mutate(
      { wishlistId, ...data },
      {
        onSuccess: () => {
          setIsEditWishlistOpen(false)
          Toast.show({ type: "success", text1: t("wishlist.updated") })
        },
        onError: (err: Error) => Toast.show({ type: "error", text1: err.message }),
      },
    )
  }

  const handleDeleteWishlist = () => {
    Alert.alert(
      t("wishlist.delete_title"),
      t("wishlist.delete_confirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            deleteWishlistMutation.mutate(wishlistId, {
              onSuccess: () => {
                navigation.goBack()
                Toast.show({ type: "success", text1: t("wishlist.deleted") })
              },
            })
          },
        },
      ],
      { cancelable: true },
    )
  }

  const handleDeleteItem = () => {
    if (!itemToDelete) return
    deleteItemMutation.mutate(itemToDelete, {
      onSuccess: () => {
        setItemToDelete(null)
        Toast.show({ type: "success", text1: t("wishlist.item_removed") })
      },
    })
  }

  const renderItem = ({ item }: { item: Item }) => {
    const isReserved = item.reservation?.status === "ACTIVE"
    const reservedByMe = item.reservation?.userId === user?.id

    return (
      <View style={styles.cardOuter}>
        <GlassCard style={styles.card} noPadding>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => item.url && Linking.openURL(item.url)}
            activeOpacity={0.8}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="gift-outline" size={32} color="rgba(255,255,255,0.15)" />
              </View>
            )}
            {isReserved && (
              <View style={styles.reservedBadge}>
                <Text style={styles.reservedText}>{t("wishlist.reserved")}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.cardContent}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title || "Untitled Item"}
            </Text>

            {item.price && (
              <Text style={styles.itemPrice}>{formatPrice(item.price, item.currency)}</Text>
            )}

            <PriceHistoryList itemId={item.id} enabled={!!item.price} />

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
                    {reservedByMe
                      ? t("wishlist.reserved_by_me")
                      : isReserved
                        ? t("wishlist.taken")
                        : t("wishlist.reserve")}
                  </Text>
                </TouchableOpacity>
              )}

              {item.url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Ionicons name="open-outline" size={20} color="#fbbf24" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </GlassCard>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="light" />

      <FlatList
        data={wishlist?.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, !wishlist?.items?.length && { flexGrow: 1 }]}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ListHeaderComponent={
          wishlist && !isOwner ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("PublicProfile", {
                  userId: wishlist.userId,
                })
              }
            >
              <GlassCard style={styles.creatorHeader}>
                <View style={styles.creatorRow}>
                  <UserAvatar user={wishlist.user} size="sm" />
                  <Text style={styles.creatorText}>
                    {t("wishlist.by", {
                      name: wishlist.user?.displayName || "",
                    })}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={64} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyTitle}>
                {isOwner ? t("wishlist.empty_owner_title") : t("wishlist.empty_visitor_title")}
              </Text>
              <Text style={styles.emptyText}>
                {isOwner
                  ? t("wishlist.empty_owner_subtitle")
                  : t("wishlist.empty_visitor_subtitle")}
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fbbf24" />
        }
      />

      {isOwner && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsAddItemOpen(true)}>
          <LinearGradient colors={["#fbbf24", "#f59e0b"]} style={styles.fabGradient}>
            <Ionicons name="add" size={32} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Add Item Sheet */}
      <GlassBottomSheet
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title={t("wishlist.add_item_title")}
      >
        <ItemForm
          onSubmit={handleAddItem}
          isLoading={addItemMutation.isPending}
          submitLabel={t("form.add_to_wishlist")}
        />
      </GlassBottomSheet>

      {/* Edit Wishlist Sheet */}
      <GlassBottomSheet
        isOpen={isEditWishlistOpen}
        onClose={() => setIsEditWishlistOpen(false)}
        title={t("wishlist.edit_title")}
      >
        <WishlistForm
          initialData={wishlist}
          onSubmit={handleUpdateWishlist}
          isLoading={updateWishlistMutation.isPending}
          submitLabel={t("common.update")}
        />
        <TouchableOpacity style={styles.deleteWishlistButton} onPress={handleDeleteWishlist}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.deleteWishlistText}>{t("wishlist.delete_title")}</Text>
        </TouchableOpacity>
      </GlassBottomSheet>

      {/* Delete Confirmation */}
      <GlassModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title={t("wishlist.remove_item")}
        footer={
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setItemToDelete(null)}>
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteItem}
              disabled={deleteItemMutation.isPending}
            >
              <Text style={styles.deleteButtonText}>{t("common.remove")}</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.modalText}>{t("wishlist.remove_item_confirm")}</Text>
      </GlassModal>
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
    paddingTop: 100,
    paddingBottom: 100,
  },
  creatorHeader: {
    marginBottom: 16,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  creatorText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: spacing["4xl"],
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.text.quaternary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  // Item Card
  cardOuter: {
    flex: 1,
    maxWidth: "48%",
    marginBottom: 12,
  },
  card: {
    padding: 0,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
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
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  reservedText: {
    color: colors.text.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: spacing.md,
  },
  itemTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    height: 40,
    letterSpacing: -0.2,
  },
  itemPrice: {
    fontSize: fontSize.base,
    color: colors.accent.primary,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
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
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    flex: 1,
    marginRight: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  reserveButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  reserveButtonDisabled: {
    opacity: 0.5,
  },
  reserveButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  reserveButtonTextActive: {
    color: "#000",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    borderRadius: 28,
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal
  modalFooter: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
  deleteButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.status.error,
    alignItems: "center",
  },
  deleteButtonText: {
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
  modalText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  deleteWishlistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  deleteWishlistText: {
    color: colors.status.error,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
  },
})
