import { usePendingSubscriptions, useApproveSubscription, useRejectSubscription } from "../hooks/api"
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { UserAvatar } from "./UserAvatar"
import { colors, fontSize, fontWeight, radius } from "../theme"
import type { Subscription } from "@wishtracker/shared"

export function PendingSubscriptions() {
  const { data: pending, isLoading } = usePendingSubscriptions()
  const approve = useApproveSubscription()
  const reject = useRejectSubscription()

  if (isLoading) return <ActivityIndicator size="small" color="#a78bfa" />
  if (!pending?.length) return null

  const handleApprove = (id: string) => {
    approve.mutate(id, {
      onSuccess: () => Alert.alert("Approved", "Subscription request approved"),
      onError: () => Alert.alert("Error", "Failed to approve"),
    })
  }

  const handleReject = (id: string) => {
    reject.mutate(id, {
      onSuccess: () => Alert.alert("Rejected", "Subscription request rejected"),
      onError: () => Alert.alert("Error", "Failed to reject"),
    })
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pending requests</Text>
      {pending.map((sub: Subscription) => (
        <View key={sub.id} style={styles.card}>
          <View style={styles.row}>
            <UserAvatar user={sub.user} size="sm" />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {sub.user?.displayName || "Someone"}
              </Text>
              <Text style={styles.wishlist} numberOfLines={1}>
                {sub.wishlist?.emoji || "📋"} {sub.wishlist?.title || "wishlist"}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => handleReject(sub.id)}
              disabled={reject.isPending}
              style={styles.rejectBtn}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleApprove(sub.id)}
              disabled={approve.isPending}
              style={styles.approveBtn}
            >
              <Text style={styles.approveText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "rgba(39,39,42,0.5)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  info: { flex: 1 },
  name: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: "#f4f4f5" },
  wishlist: { fontSize: fontSize.sm, color: colors.mutedForeground },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  rejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectText: { fontSize: fontSize.sm, color: colors.mutedForeground },
  approveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: "#a78bfa",
  },
  approveText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: "#000" },
})
