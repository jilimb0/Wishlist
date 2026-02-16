import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlassCard } from "../components/GlassCard"
import { UserAvatar } from "../components/UserAvatar"
import {
  useMySubscriptions,
  useSubscribeToWishlist,
  useUnsubscribeFromWishlist,
} from "../hooks/api"
import { useI18n } from "../i18n/context"

export default function FollowingScreen() {
  const { data: subscriptions, isLoading, refetch } = useMySubscriptions()
  const navigation = useNavigation<any>()
  const subscribeMutation = useSubscribeToWishlist()
  const unsubscribeMutation = useUnsubscribeFromWishlist()
  const { t } = useI18n()

  const renderItem = ({ item }: { item: any }) => {
    const { wishlist } = item
    const isSubscribed = !!item.id

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ flex: 1, maxWidth: "48%" }}
        onPress={() => navigation.navigate("WishlistDetail", { wishlistId: wishlist.id })}
      >
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.emoji}>{wishlist.emoji}</Text>
              <Text style={styles.title} numberOfLines={1}>
                {wishlist.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                if (isSubscribed && item.id) {
                  unsubscribeMutation.mutate(item.id)
                } else {
                  subscribeMutation.mutate(wishlist.id)
                }
              }}
            >
              <Ionicons
                name={isSubscribed ? "bookmark" : "bookmark-outline"}
                size={20}
                color="#fbbf24"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <UserAvatar user={wishlist.user} size="xs" />
            <Text style={styles.ownerName}>
              {t("wishlist.by", { name: wishlist.user.displayName })}
            </Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("following.title")}</Text>
      </View>

      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fbbf24" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={64} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyTitle}>{t("following.empty_title")}</Text>
            <Text style={styles.emptySubtitle}>{t("following.empty_subtitle")}</Text>
          </View>
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
    padding: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  list: {
    padding: 16,
  },
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
  emoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    letterSpacing: -0.3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ownerName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 8,
    textAlign: "center",
    maxWidth: 260,
  },
})
