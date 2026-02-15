import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { UserAvatar } from "../components/UserAvatar"
import { useDiscover, useSearchUsers, useSendFriendRequest } from "../hooks/api"

export default function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState<"wishlists" | "users">("wishlists")
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("") // Debounced or actual query
  const navigation = useNavigation<any>()

  // Hooks
  const { data: discoverData, isLoading: _isLoadingDiscover } = useDiscover(query)
  const { data: _usersData, isLoading: _isLoadingUsers } = useSearchUsers(query)
  const sendRequestMutation = useSendFriendRequest()

  const handleSearch = () => {
    setQuery(search)
  }

  const handleSendRequest = (userId: string) => {
    sendRequestMutation.mutate(userId, {
      onSuccess: () => Toast.show({ type: "success", text1: "Friend request sent" }),
      onError: () => Toast.show({ type: "error", text1: "Failed to send request" }),
    })
  }

  const renderWishlist = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("WishlistDetail", { wishlistId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.cardFooter}>
        <UserAvatar user={item.user} size="sm" />
        <Text style={styles.cardOwner}>{item.user.displayName}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate("PublicProfile", { userId: item.id })}
    >
      <UserAvatar user={item} size="md" />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => handleSendRequest(item.id)}>
        <Ionicons name="person-add-outline" size={20} color="#000" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#71717a" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#71717a"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "wishlists" && styles.activeTab]}
            onPress={() => setActiveTab("wishlists")}
          >
            <Text style={[styles.tabText, activeTab === "wishlists" && styles.activeTabText]}>
              Wishlists
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "users" && styles.activeTab]}
            onPress={() => setActiveTab("users")}
          >
            <Text style={[styles.tabText, activeTab === "users" && styles.activeTabText]}>
              People
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "wishlists" ? (
        <FlatList
          data={discoverData?.wishlists || []}
          renderItem={renderWishlist}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: 12 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No wishlists found</Text>}
        />
      ) : (
        <FlatList
          data={usersData || []}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
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
    color: "#71717a",
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
    flex: 1,
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  cardHeader: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
    alignItems: "center",
    gap: 8,
  },
  cardOwner: {
    fontSize: 12,
    color: "#71717a",
  },
  // User Card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fbbf24",
    justifyContent: "center",
    alignItems: "center",
  },
})
