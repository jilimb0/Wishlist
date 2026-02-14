import React from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { usePublicProfile, useDiscoverByUser } from "../hooks/api"
import { UserAvatar } from "../components/UserAvatar"

export default function PublicProfileScreen() {
  const { params } = useRoute<any>()
  // @ts-ignore
  const { userId } = params
  const navigation = useNavigation<any>()

  const { data: user, isLoading: loadingUser } = usePublicProfile(userId)
  const { data: wishlists, isLoading: loadingWishlists } =
    useDiscoverByUser(userId)

  const renderWishlist = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("WishlistDetail", { wishlistId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardCount}>{item._count?.items || 0} items</Text>
    </TouchableOpacity>
  )

  const ListHeader = () => (
    <View style={styles.header}>
      <UserAvatar user={user} size="xl" />
      <Text style={styles.name}>{user?.displayName}</Text>
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
          <RefreshControl refreshing={loadingUser || loadingWishlists} />
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
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
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
  },
  cardCount: {
    fontSize: 12,
    color: "#71717a",
  },
})
