import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Toast from "react-native-toast-message"
import { BottomSheet } from "../components/BottomSheet"
import { Modal } from "../components/Modal"
import { UserAvatar } from "../components/UserAvatar"
import { WishlistForm } from "../components/WishlistForm"
import { useAuth } from "../context/AuthContext"
import { useCreateWishlist, useDeleteWishlist, useMyWishlists } from "../hooks/api"
import type { Wishlist } from "../types"

export default function DashboardScreen() {
  const { user } = useAuth()
  const navigation = useNavigation<any>()
  const { data: wishlists, isLoading, refetch } = useMyWishlists()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [wishlistToDelete, setWishlistToDelete] = useState<string | null>(null)

  const createMutation = useCreateWishlist()
  // @ts-ignore
  const deleteMutation = useDeleteWishlist()

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false)
        Toast.show({
          type: "success",
          text1: "Wishlist created",
          text2: "Start adding your wishes!",
        })
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Error",
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
          text1: "Wishlist deleted",
        })
      },
    })
  }

  const renderWishlistCard = ({ item }: { item: Wishlist }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("WishlistDetail", {
          wishlistId: item.id,
          title: item.title, // pass title for immediate header update
        })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.emojiContainer}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setWishlistToDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#52525b" />
        </TouchableOpacity>
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardCount}>{item._count?.items || 0} items</Text>

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
            color="#71717a"
          />
        </View>
      </View>
    </TouchableOpacity>
  )

  const ListHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.displayName}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <UserAvatar user={user} size="md" />
      </TouchableOpacity>
    </View>
  )

  // Empty State
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>✨</Text>
      <Text style={styles.emptyTitle}>No wishlists yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first wishlist and start tracking the things you love
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={() => setIsCreateOpen(true)}>
        <Text style={styles.emptyButtonText}>Create Wishlist</Text>
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
        columnWrapperStyle={{ justifyContent: "space-between" }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fbbf24" />
        }
      />

      {/* FAB */}
      {wishlists && wishlists.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsCreateOpen(true)}>
          <Ionicons name="add" size={32} color="#000" />
        </TouchableOpacity>
      )}

      {/* Create Wishlist Sheet */}
      <BottomSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Wishlist"
      >
        <WishlistForm
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          submitLabel="Create Wishlist"
        />
      </BottomSheet>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!wishlistToDelete}
        onClose={() => setWishlistToDelete(null)}
        title="Delete Wishlist"
        footer={
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setWishlistToDelete(null)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Text style={styles.deleteButtonText}>
                {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.modalText}>
          Are you sure you want to delete this wishlist? This action cannot be undone.
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
    paddingBottom: 100, // Space for FAB
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    width: "100%", // For column wrapper
  },
  welcomeText: {
    fontSize: 14,
    color: "#a1a1aa",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: "48%", // 2 columns
    borderWidth: 1,
    borderColor: "#27272a",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardCount: {
    fontSize: 12,
    color: "#71717a",
  },
  privacyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    maxWidth: 260,
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  emptyButtonText: {
    color: "#fbbf24",
    fontWeight: "600",
    fontSize: 14,
  },
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
