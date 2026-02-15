import { Ionicons } from "@expo/vector-icons"
import { DateTime } from "luxon"
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from "../hooks/api"
import { useI18n } from "../i18n/context"
import { NotificationType } from "../types"

export default function NotificationsScreen() {
  const { t, locale } = useI18n()
  const { data, isLoading, refetch } = useNotifications(20)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const notifications = data?.notifications || []

  const renderItem = ({ item: n }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => !n.isRead && markAsRead.mutate(n.id)}
      style={[styles.notificationItem, !n.isRead && styles.unreadItem]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>
          {n.type === NotificationType.RESERVATION
            ? "🎁"
            : n.type === NotificationType.NEW_ITEM
              ? "✨"
              : "🔔"}
        </Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{n.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {n.message}
        </Text>
        <Text style={styles.time}>
          {DateTime.fromISO(n.createdAt).setLocale(locale).toRelative()}
        </Text>
      </View>
      {!n.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
        {notifications.some((n) => !n.isRead) && (
          <TouchableOpacity onPress={() => markAllAsRead.mutate()}>
            <Text style={styles.markAllText}>{t("notifications.mark_all_read")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={64} color="#27272a" />
          <Text style={styles.emptyText}>{t("notifications.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  markAllText: {
    fontSize: 12,
    color: "#ffc107",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
    alignItems: "center",
  },
  unreadItem: {
    backgroundColor: "rgba(255, 193, 7, 0.03)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#18181b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f5f5f5",
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: "#a1a1aa",
    marginBottom: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: "#71717a",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffc107",
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: "#71717a",
    textAlign: "center",
    fontWeight: "500",
  },
})
