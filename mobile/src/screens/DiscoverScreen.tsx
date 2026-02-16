import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { GlassCard } from "../components/GlassCard"
import { UserAvatar } from "../components/UserAvatar"
import { useAuth } from "../context/AuthContext"
import {
  useDiscover,
  useFriends,
  usePendingFriends,
  useSearchUsers,
  useSendFriendRequest,
  useSubscribeToWishlist,
  useUnsubscribeFromWishlist,
} from "../hooks/api"
import { useI18n } from "../i18n/context"

export default function DiscoverScreen() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"wishlists" | "users">("wishlists")
  const [search, setSearch] = useState("")
  const navigation = useNavigation<any>()
  const { t } = useI18n()

  const { data: discoverData } = useDiscover(search)
  const { data: usersData } = useSearchUsers(search)
  const { data: friends } = useFriends()
  const { data: pendingRequests } = usePendingFriends()
  const sendRequestMutation = useSendFriendRequest()
  const subscribeMutation = useSubscribeToWishlist()
  const unsubscribeMutation = useUnsubscribeFromWishlist()

  const filteredWishlists = (discoverData?.wishlists || []).filter((wishlist: any) => {
    if (wishlist.userId === user?.id) return false
    if (wishlist.subscriptions?.some((sub: any) => sub.userId === user?.id)) return false
    return true
  })

  const handleSendRequest = (userId: string) => {
    sendRequestMutation.mutate(userId, {
      onSuccess: () =>
        Toast.show({
          type: "success",
          text1: t("discover.request_sent_success"),
        }),
      onError: () => Toast.show({ type: "error", text1: t("discover.request_error") }),
    })
  }

  const renderWishlist = ({ item }: { item: any }) => {
    const userSubscription = item.subscriptions?.find((sub: any) => sub.userId === user?.id)
    const isSubscribed = !!userSubscription
    const isOwner = item.userId === user?.id

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ flex: 1, maxWidth: "48%" }}
        onPress={() => navigation.navigate("WishlistDetail", { wishlistId: item.id })}
      >
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            {!isOwner && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  if (isSubscribed && userSubscription) {
                    unsubscribeMutation.mutate(userSubscription.id)
                  } else {
                    subscribeMutation.mutate(item.id)
                  }
                }}
              >
                <Ionicons
                  name={isSubscribed ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color="#fbbf24"
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.cardFooter}>
            <UserAvatar user={item.user} size="xs" />
            <Text style={styles.cardOwner}>{item.user?.displayName}</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    )
  }

  const renderUser = ({ item }: { item: any }) => {
    const isFriend = friends?.some((f: any) => f.id === item.id)
    const hasPendingRequest = pendingRequests?.some(
      (req: any) => req.user?.id === item.id || req.friendId === item.id,
    )

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("PublicProfile", { userId: item.id })}
      >
        <GlassCard style={styles.userCard}>
          <View style={styles.userCardInner}>
            <UserAvatar user={item} size="md" />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.displayName}</Text>
            </View>
            {isFriend ? (
              <View style={styles.friendBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
            ) : hasPendingRequest ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>{t("discover.pending")}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation()
                  handleSendRequest(item.id)
                }}
              >
                <Ionicons name="person-add-outline" size={18} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>{t("discover.title")}</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.3)" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("discover.search_placeholder")}
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "wishlists" && styles.activeTab]}
            onPress={() => setActiveTab("wishlists")}
          >
            <Text style={[styles.tabText, activeTab === "wishlists" && styles.activeTabText]}>
              {t("discover.tab_wishlists")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "users" && styles.activeTab]}
            onPress={() => setActiveTab("users")}
          >
            <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>
              {t("discover.tab_users")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "wishlists" ? (
        <FlatList
          key="wishlists"
          data={filteredWishlists}
          renderItem={renderWishlist}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: 12 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t("discover.no_results_lists")}</Text>
          }
        />
      ) : (
        <FlatList
          key="users"
          data={usersData || []}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t("discover.no_results_users")}</Text>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#fff",
    fontSize: 16,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    marginRight: 24,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#fbbf24",
  },
  tabText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  list: {
    padding: 16,
  },
  emptyText: {
    color: "#71717a",
    textAlign: "center",
    marginTop: 32,
  },
  // Wishlist Card
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardOwner: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  // User Card
  userCard: {
    marginBottom: 10,
  },
  userCardInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: -0.3,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fbbf24",
    justifyContent: "center",
    alignItems: "center",
  },
  friendBadge: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  pendingText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "600",
  },
})
