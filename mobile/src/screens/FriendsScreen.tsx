import { Ionicons } from "@expo/vector-icons"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlassCard } from "../components/GlassCard"
import { UserAvatar } from "../components/UserAvatar"
import { useAuth } from "../context/AuthContext"
import {
  useCancelFriendRequest,
  useFriends,
  usePendingFriends,
  useRespondFriendRequest,
} from "../hooks/api"
import { useI18n } from "../i18n/context"
import { colors, fontSize, fontWeight, radius, spacing } from "../theme"

export default function FriendsScreen() {
  const { user } = useAuth()
  const { data: friends, isLoading: loadingFriends, refetch } = useFriends()
  const { data: allPendingRequests, isLoading: loadingPending } = usePendingFriends()
  const respondMutation = useRespondFriendRequest()
  const cancelRequestMutation = useCancelFriendRequest()
  const { t } = useI18n()

  const incomingRequests = allPendingRequests?.filter(
    (req: Record<string, unknown>) => req.friendId === user?.id,
  )
  const outgoingRequests = allPendingRequests?.filter(
    (req: Record<string, unknown>) => req.userId === user?.id,
  )

  const renderFriend = ({ item }: { item: Record<string, unknown> }) => (
    <GlassCard style={styles.friendCard}>
      <View style={styles.friendItem}>
        <UserAvatar user={item} size="md" />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.displayName}</Text>
        </View>
      </View>
    </GlassCard>
  )

  const renderIncomingRequest = ({ item }: { item: Record<string, unknown> }) => (
    <GlassCard style={styles.requestCard}>
      <View style={styles.requestItem}>
        <UserAvatar user={item.user} size="md" />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.user?.displayName}</Text>
          <Text style={styles.requestText}>{t("friends.wants_friend")}</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => respondMutation.mutate({ id: item.id, accept: true })}
          >
            <Ionicons name="checkmark" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => respondMutation.mutate({ id: item.id, accept: false })}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  )

  const renderOutgoingRequest = ({ item }: { item: Record<string, unknown> }) => (
    <GlassCard style={styles.requestCard}>
      <View style={styles.requestItem}>
        <UserAvatar user={item.friend} size="md" />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.friend?.displayName}</Text>
          <Text style={styles.requestText}>{t("friends.request_sent")}</Text>
        </View>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => cancelRequestMutation.mutate(item.id)}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </GlassCard>
  )

  const isLoading = loadingFriends || loadingPending

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      ) : friends &&
        friends.length === 0 &&
        (!incomingRequests || incomingRequests.length === 0) &&
        (!outgoingRequests || outgoingRequests.length === 0) ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.1)" />
          <Text style={styles.emptyText}>{t("friends.empty_title")}</Text>
          <Text style={styles.emptySubtext}>{t("friends.empty_subtitle")}</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(incomingRequests || []).map((req: Record<string, unknown>) => ({
              ...req,
              _type: "incoming",
            })),
            ...(outgoingRequests || []).map((req: Record<string, unknown>) => ({
              ...req,
              _type: "outgoing",
            })),
            ...(friends || []).map((friend: Record<string, unknown>) => ({
              ...friend,
              _type: "friend",
            })),
          ]}
          renderItem={({ item }: { item: Record<string, unknown> }) => {
            if (item._type === "incoming") {
              return renderIncomingRequest({ item })
            }
            if (item._type === "outgoing") {
              return renderOutgoingRequest({ item })
            }
            return renderFriend({ item })
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            incomingRequests && incomingRequests.length > 0 ? (
              <Text style={styles.sectionTitle}>{t("friends.incoming")}</Text>
            ) : null
          }
          ItemSeparatorComponent={({ leadingItem }: { leadingItem: Record<string, unknown> }) => {
            if (
              leadingItem._type === "incoming" &&
              incomingRequests &&
              incomingRequests.length > 0
            ) {
              const currentIndex = incomingRequests.findIndex(
                (r: Record<string, unknown>) => r.id === leadingItem.id,
              )
              if (currentIndex === incomingRequests.length - 1) {
                if (outgoingRequests && outgoingRequests.length > 0) {
                  return <Text style={styles.sectionTitle}>{t("friends.outgoing")}</Text>
                }
                if (friends && friends.length > 0) {
                  return <Text style={styles.friendsTitle}>{t("friends.title")}</Text>
                }
              }
            }
            if (
              leadingItem._type === "outgoing" &&
              outgoingRequests &&
              outgoingRequests.length > 0
            ) {
              const currentIndex = outgoingRequests.findIndex(
                (r: Record<string, unknown>) => r.id === leadingItem.id,
              )
              if (currentIndex === outgoingRequests.length - 1 && friends && friends.length > 0) {
                return <Text style={styles.friendsTitle}>{t("friends.title")}</Text>
              }
            }
            return null
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["4xl"],
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: "rgba(255,255,255,0.35)",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  friendsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: "rgba(255,255,255,0.35)",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  listContent: {
    paddingTop: 65,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  friendCard: {
    marginBottom: spacing.sm,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  requestCard: {
    marginBottom: spacing.sm,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
    letterSpacing: -0.3,
  },
  requestText: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.45)",
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.text.primary,
    textAlign: "center",
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
    color: colors.text.quaternary,
    textAlign: "center",
  },
})
