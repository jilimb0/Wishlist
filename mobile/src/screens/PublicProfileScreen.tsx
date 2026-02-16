import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "expo-status-bar"
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { GlassCard } from "../components/GlassCard"
import { UserAvatar } from "../components/UserAvatar"
import { useAuth } from "../context/AuthContext"
import {
  useCancelFriendRequest,
  useDiscoverByUser,
  useFriends,
  usePendingFriends,
  usePublicProfile,
  useRemoveFriendship,
  useRespondFriendRequest,
  useSendFriendRequest,
} from "../hooks/api"
import { useI18n } from "../i18n/context"

export default function PublicProfileScreen() {
  const { params } = useRoute<any>()
  // @ts-ignore
  const { userId } = params
  const navigation = useNavigation<any>()
  const { user: currentUser } = useAuth()
  const { t } = useI18n()

  const { data: user, isLoading: loadingUser } = usePublicProfile(userId)
  const { data: wishlists, isLoading: loadingWishlists } = useDiscoverByUser(userId)
  const { data: friends, refetch: refetchFriends } = useFriends()
  const { data: allPendingRequests, refetch: refetchPending } = usePendingFriends()

  const sendRequestMutation = useSendFriendRequest()
  const cancelRequestMutation = useCancelFriendRequest()
  const respondMutation = useRespondFriendRequest()
  const removeFriendshipMutation = useRemoveFriendship()

  const isFriend = friends?.some((f: any) => f.id === userId)
  const friend = friends?.find((f: any) => f.id === userId)
  const myOutgoingRequest = allPendingRequests?.find(
    (req: any) => req.userId === currentUser?.id && req.friendId === userId,
  )
  const incomingRequest = allPendingRequests?.find(
    (req: any) => req.userId === userId && req.friendId === currentUser?.id,
  )
  // Note: friendshipId might be available as a separate field on friend object
  // const friendshipId = friend?.friendshipId
  const hasIncomingRequest = !!incomingRequest

  const handleAddFriend = () => {
    sendRequestMutation.mutate(userId, {
      onSuccess: () => {
        refetchPending()
        Toast.show({
          type: "success",
          text1: t("discover.request_sent_success"),
        })
      },
      onError: () => Toast.show({ type: "error", text1: t("discover.request_error") }),
    })
  }

  const handleCancelRequest = () => {
    if (!myOutgoingRequest) return
    cancelRequestMutation.mutate(myOutgoingRequest.id, {
      onSuccess: () => {
        refetchPending()
        Toast.show({ type: "success", text1: t("friends.request_cancelled") })
      },
    })
  }

  const handleRemoveFriend = () => {
    if (!friend) return
    // Using userId directly - adjust if API requires friendshipId
    removeFriendshipMutation.mutate(userId, {
      onSuccess: () => {
        refetchFriends()
        refetchPending()
        Toast.show({ type: "success", text1: t("friends.removed") })
      },
    })
  }

  const handleAcceptRequest = () => {
    if (!incomingRequest) return
    respondMutation.mutate(
      { id: incomingRequest.id, accept: true },
      {
        onSuccess: () => {
          refetchFriends()
          refetchPending()
          Toast.show({ type: "success", text1: t("friends.request_accepted") })
        },
      },
    )
  }

  const handleDeclineRequest = () => {
    if (!incomingRequest) return
    respondMutation.mutate(
      { id: incomingRequest.id, accept: false },
      {
        onSuccess: () => {
          refetchPending()
          Toast.show({ type: "success", text1: t("friends.request_declined") })
        },
      },
    )
  }

  const renderWishlist = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{ flex: 1, maxWidth: "48%" }}
      onPress={() => navigation.navigate("WishlistDetail", { wishlistId: item.id })}
    >
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardCount}>
          {t("dashboard.item_count", { count: item._count?.items || 0 })}
        </Text>
      </GlassCard>
    </TouchableOpacity>
  )

  const ListHeader = () => (
    <View style={styles.header}>
      <UserAvatar user={user} size="xl" />
      <Text style={styles.name}>{user?.displayName}</Text>

      {currentUser?.id !== userId && (
        <View style={styles.actionButtons}>
          {hasIncomingRequest ? (
            <View style={styles.requestActions}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptRequest}>
                <Ionicons name="checkmark" size={20} color="#000" />
                <Text style={styles.acceptButtonText}>{t("friends.accept")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineButton} onPress={handleDeclineRequest}>
                <Ionicons name="close" size={20} color="#fff" />
                <Text style={styles.declineButtonText}>{t("friends.decline")}</Text>
              </TouchableOpacity>
            </View>
          ) : isFriend ? (
            <TouchableOpacity style={styles.removeFriendButton} onPress={handleRemoveFriend}>
              <Ionicons name="person-remove-outline" size={20} color="#ef4444" />
              <Text style={styles.removeFriendButtonText}>{t("friends.remove")}</Text>
            </TouchableOpacity>
          ) : myOutgoingRequest ? (
            <TouchableOpacity style={styles.pendingButton} onPress={handleCancelRequest}>
              <Ionicons name="hourglass-outline" size={20} color="#a1a1aa" />
              <Text style={styles.pendingButtonText}>{t("friends.cancel_request")}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
              <LinearGradient
                colors={["#fbbf24", "#f59e0b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addFriendGradient}
              >
                <Ionicons name="person-add-outline" size={20} color="#000" />
                <Text style={styles.addFriendButtonText}>{t("discover.add_friend")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <FlatList
        data={wishlists || []}
        renderItem={renderWishlist}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={loadingUser || loadingWishlists} tintColor="#fbbf24" />
        }
        ListEmptyComponent={
          !loadingWishlists ? (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={48} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>
                {t("profile.no_public_wishlists", {
                  name: user?.displayName || "",
                })}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    alignItems: "center",
    padding: 24,
    paddingTop: 80,
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  actionButtons: {
    width: "100%",
    paddingHorizontal: 24,
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fbbf24",
    padding: 14,
    borderRadius: 14,
  },
  acceptButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  declineButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  addFriendButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  addFriendGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },
  addFriendButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  pendingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  pendingButtonText: {
    color: "#a1a1aa",
    fontWeight: "600",
    fontSize: 16,
  },
  removeFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  removeFriendButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#71717a",
    textAlign: "center",
    maxWidth: 260,
  },
})
