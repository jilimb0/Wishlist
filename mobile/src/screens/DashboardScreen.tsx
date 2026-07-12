import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { GlassBottomSheet } from "../components/GlassBottomSheet"
import { GlassCard } from "../components/GlassCard"
import { GlassModal } from "../components/GlassModal"
import { UserAvatar } from "../components/UserAvatar"
import { WishlistForm } from "../components/WishlistForm"
import { useAuth } from "../context/AuthContext"
import {
  useCreateWishlist,
  useDeleteWishlist,
  useMyWishlists,
  useNotifications,
} from "../hooks/api"
import { useI18n } from "../i18n/context"
import { colors, fontSize, fontWeight, radius, spacing } from "../theme"
import type { Wishlist } from "../types"

export default function DashboardScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const { data: wishlists, isLoading, refetch } = useMyWishlists()
  const { data: notificationsData } = useNotifications(10)
  const { t } = useI18n()

  const unreadCount = notificationsData?.notifications.filter((n) => !n.isRead).length || 0

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [wishlistToDelete, setWishlistToDelete] = useState<string | null>(null)

  const createMutation = useCreateWishlist()
  const deleteMutation = useDeleteWishlist()

  const handleCreate = (data: Record<string, unknown>) => {
    createMutation.mutate(data, {
      onSuccess: (createdWishlist) => {
        setIsCreateOpen(false)
        Toast.show({
          type: "success",
          text1: t("wishlist.created"),
          text2: t("wishlist.created_subtitle"),
        })
        navigation.navigate("WishlistDetail", {
          wishlistId: createdWishlist.id,
          title: createdWishlist.title,
        })
      },
      onError: (err: Error) => {
        Toast.show({
          type: "error",
          text1: t("common.error"),
          text2: err.message,
        })
      },
    })
  }

  const handleDelete = () => {
    if (!wishlistToDelete) return
    deleteMutation.mutate(wishlistToDelete, {
      onSuccess: () => {
        setWishlistToDelete(null)
        Toast.show({
          type: "success",
          text1: t("wishlist.deleted"),
        })
      },
    })
  }

  const renderWishlistCard = ({ item }: { item: Wishlist }) => (
    <View style={styles.cardOuter}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("WishlistDetail", {
            wishlistId: item.id,
            title: item.title,
          })
        }
        style={styles.cardTouchable}
      >
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setWishlistToDelete(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color="#52525b" />
            </TouchableOpacity>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardCount}>
              {t("dashboard.item_count", { count: item._count?.items || 0 })}
            </Text>

            <View style={styles.privacyBadge}>
              <Ionicons
                name={
                  item.privacy === "PUBLIC"
                    ? "globe-outline"
                    : item.privacy === "FRIENDS"
                      ? "people-outline"
                      : "lock-closed-outline"
                }
                size={12}
                color="rgba(255,255,255,0.4)"
              />
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </View>
  )

  const ListHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>{t("dashboard.welcome")}</Text>
        <Text style={styles.userName}>{user?.displayName}</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Notifications")}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#f5f5f5" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <UserAvatar user={user} size="md" />
        </TouchableOpacity>
      </View>
    </View>
  )

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>✨</Text>
      <Text style={styles.emptyTitle}>{t("dashboard.mobile_empty_title")}</Text>
      <Text style={styles.emptySubtitle}>{t("dashboard.mobile_empty_subtitle")}</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={() => setIsCreateOpen(true)}>
        <LinearGradient
          colors={["#fbbf24", "#f59e0b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonText}>{t("dashboard.create_wishlist")}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <FlatList
        data={wishlists}
        renderItem={renderWishlistCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, !wishlists?.length && { flex: 1 }]}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={!isLoading ? EmptyState : null}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fbbf24" />
        }
      />

      {/* FAB */}
      {wishlists && wishlists.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsCreateOpen(true)}>
          <LinearGradient colors={["#fbbf24", "#f59e0b"]} style={styles.fabGradient}>
            <Ionicons name="add" size={32} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Create Wishlist Sheet */}
      <GlassBottomSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t("form.new_wishlist")}
      >
        <WishlistForm
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          submitLabel={t("form.create")}
        />
      </GlassBottomSheet>

      {/* Delete Confirmation Modal */}
      <GlassModal
        isOpen={!!wishlistToDelete}
        onClose={() => setWishlistToDelete(null)}
        title={t("wishlist.delete_title")}
        footer={
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setWishlistToDelete(null)}>
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Text style={styles.deleteButtonText}>
                {deleteMutation.isPending ? t("common.deleting") : t("common.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.modalText}>{t("wishlist.delete_confirm")}</Text>
      </GlassModal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 90,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    width: "100%",
    paddingTop: spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.status.error,
    minWidth: 16,
    height: 16,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  notificationBadgeText: {
    color: colors.text.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  welcomeText: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  cardOuter: {
    flex: 1,
    marginBottom: spacing.md,
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardEmoji: {
    fontSize: fontSize.xl,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardCount: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.5)",
  },
  privacyBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 85,
    right: spacing["2xl"],
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: fontSize["3xl"] + 32,
    marginBottom: spacing.lg,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    textAlign: "center",
    maxWidth: 260,
    marginBottom: spacing["2xl"],
  },
  emptyButton: {
    borderRadius: radius.full,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: 28,
    borderRadius: radius.full,
  },
  emptyButtonText: {
    color: "#000",
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
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
})
