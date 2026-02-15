import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { StatusBar } from "expo-status-bar"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { UserAvatar } from "../components/UserAvatar"
import { useAuth } from "../context/AuthContext"
import { useLogout, useUpdateProfile, useUploadAvatar } from "../hooks/api"

export default function ProfileScreen() {
  const { user: _user, token: _token } = useAuth()
  const logoutMutation = useLogout()
  const updateProfileMutation = useUpdateProfile()
  const uploadAvatarMutation = useUploadAvatar()
  const { logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logoutMutation.mutate(undefined, {
            onSuccess: () => logout(),
            onError: () => logout(), // Force logout anyway
          })
        },
      },
    ])
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      const asset = result.assets[0]
      // @ts-ignore
      uploadAvatarMutation.mutate(
        {
          uri: asset.uri,
          name: asset.fileName || "avatar.jpg",
          type: asset.mimeType || "image/jpeg",
        },
        {
          onSuccess: () => Toast.show({ type: "success", text1: "Avatar updated" }),
          onError: () => Toast.show({ type: "error", text1: "Failed to update avatar" }),
        },
      )
    }
  }

  const toggleCurrency = () => {
    const newCurrency = user?.currency === "USD" ? "EUR" : "USD" // Simple toggle for now
    updateProfileMutation.mutate({ currency: newCurrency })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <UserAvatar user={user} size="xl" />
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#000" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="cash-outline" size={24} color="#fbbf24" />
              <Text style={styles.rowLabel}>Currency ({user?.currency})</Text>
            </View>
            <TouchableOpacity onPress={toggleCurrency}>
              <Text style={styles.actionText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="language-outline" size={24} color="#fbbf24" />
              <Text style={styles.rowLabel}>Language ({user?.language})</Text>
            </View>
            <Text style={styles.valueText}>{user?.language === "en" ? "English" : "Russian"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="people-outline" size={24} color="#fbbf24" />
              <Text style={styles.rowLabel}>Friends</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#52525b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={24} color="#fbbf24" />
              <Text style={styles.rowLabel}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#52525b" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fbbf24",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0a0a0a",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#71717a",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#71717a",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#18181b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  actionText: {
    color: "#fbbf24",
    fontWeight: "600",
  },
  valueText: {
    color: "#71717a",
  },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    color: "#3f3f46",
    fontSize: 12,
  },
})
