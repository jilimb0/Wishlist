import React from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useMySubscriptions } from "../hooks/api"
import { UserAvatar } from "../components/UserAvatar"
import { useNavigation } from "@react-navigation/native"

export default function FollowingScreen() {
  const { data: subscriptions, isLoading, refetch } = useMySubscriptions()
  const navigation = useNavigation<any>()

  const renderItem = ({ item }: { item: any }) => {
    const { wishlist } = item
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("WishlistDetail", { wishlistId: wishlist.id })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.emoji}>{wishlist.emoji}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Following</Text>
          </View>
        </View>

        <Text style={styles.title}>{wishlist.title}</Text>

        <View style={styles.footer}>
          <UserAvatar user={wishlist.user} size="xs" />
          <Text style={styles.ownerName}>by {wishlist.user.displayName}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Following</Text>
      </View>

      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#fbbf24"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              You haven't followed any wishlists yet.
            </Text>
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
  },
  list: {
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  badge: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fbbf24",
    fontSize: 10,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ownerName: {
    fontSize: 12,
    color: "#71717a",
  },
  empty: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    color: "#71717a",
    textAlign: "center",
  },
})
