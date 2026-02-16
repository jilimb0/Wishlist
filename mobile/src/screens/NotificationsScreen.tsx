import { Ionicons } from "@expo/vector-icons"
import { DateTime } from "luxon"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GlassCard } from "../components/GlassCard"
import { useMarkAsRead, useNotifications } from "../hooks/api"
import { useI18n } from "../i18n/context"
import { NotificationType } from "../types"

export default function NotificationsScreen() {
  const { t, locale } = useI18n()
  const { data, isLoading, refetch } = useNotifications(20)
  const markAsRead = useMarkAsRead()

  const notifications = data?.notifications || []

  const renderItem = ({ item: n }: { item: any }) => {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => !n.isRead && markAsRead.mutate(n.id)}>
        <GlassCard>
          <View style={styles.notificationRow}>
            <View style={[styles.iconContainer, ...(n.isRead ? [] : [styles.iconContainerUnread])]}>
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
          </View>
        </GlassCard>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC107" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={64} color="rgba(255,255,255,0.1)" />
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
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationCard: {
    marginBottom: 8,
  },
  unreadCard: {
    borderColor: "rgba(251, 191, 36, 0.15)",
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconContainerUnread: {
    backgroundColor: "rgba(251, 191, 36, 0.08)",
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
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
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
