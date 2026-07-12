import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { GlassCard } from "../components/GlassCard"
import { GlassModal } from "../components/GlassModal"
import { PendingSubscriptions } from "../components/PendingSubscriptions"
import { UserAvatar } from "../components/UserAvatar"
import { useAuth } from "../context/AuthContext"
import { useLogout, useUpdateProfile, useUploadAvatar } from "../hooks/api"
import { useI18n } from "../i18n/context"
import { colors, fontSize, fontWeight, radius, spacing } from "../theme"

export default function ProfileScreen() {
  const { user, updateUser } = useAuth()
  const navigation = useNavigation()
  const logoutMutation = useLogout()
  const updateProfileMutation = useUpdateProfile()
  const uploadAvatarMutation = useUploadAvatar()
  const { logout } = useAuth()
  const { t } = useI18n()

  const [isEditNameOpen, setIsEditNameOpen] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false)
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false)

  const handleLogout = () => {
    Alert.alert(t("profile.sign_out"), t("profile.sign_out_confirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.sign_out"),
        style: "destructive",
        onPress: () => {
          logoutMutation.mutate(undefined, {
            onSuccess: () => logout(),
            onError: () => logout(),
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
      // @ts-expect-error
      uploadAvatarMutation.mutate(
        {
          uri: asset.uri,
          name: asset.fileName || "avatar.jpg",
          type: asset.mimeType || "image/jpeg",
        },
        {
          onSuccess: () => Toast.show({ type: "success", text1: t("profile.avatar_updated") }),
          onError: () =>
            Toast.show({
              type: "error",
              text1: t("profile.avatar_update_failed"),
            }),
        },
      )
    }
  }

  const handleUpdateName = () => {
    if (!displayName.trim()) {
      Toast.show({ type: "error", text1: t("profile.name_empty") })
      return
    }
    updateProfileMutation.mutate(
      { displayName: displayName.trim() },
      {
        onSuccess: (data) => {
          setIsEditNameOpen(false)
          updateUser(data)
          Toast.show({ type: "success", text1: t("profile.name_updated") })
        },
        onError: () => Toast.show({ type: "error", text1: t("profile.name_update_failed") }),
      },
    )
  }

  const handleCurrencySelect = (currency: string) => {
    updateProfileMutation.mutate(
      { currency },
      {
        onSuccess: (data) => {
          setIsCurrencyPickerOpen(false)
          updateUser(data)
          Toast.show({ type: "success", text1: t("profile.currency_updated") })
        },
      },
    )
  }

  const handleLanguageSelect = (language: string) => {
    updateProfileMutation.mutate(
      { language },
      {
        onSuccess: (data) => {
          setIsLanguagePickerOpen(false)
          updateUser(data)
          Toast.show({ type: "success", text1: t("profile.language_updated") })
        },
      },
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            <UserAvatar user={user} size="xl" />
            <LinearGradient colors={["#fbbf24", "#f59e0b"]} style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditNameOpen(true)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.name}>{user?.displayName}</Text>
              <Ionicons name="pencil" size={18} color="#fbbf24" />
            </View>
          </TouchableOpacity>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.settings_section")}</Text>

          <TouchableOpacity onPress={() => setIsCurrencyPickerOpen(true)}>
            <GlassCard style={styles.rowCard}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="cash-outline" size={20} color="#fbbf24" />
                  </View>
                  <Text style={styles.rowLabel}>{t("profile.currency")}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.valueText}>{user?.currency}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#52525b" />
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLanguagePickerOpen(true)}>
            <GlassCard style={styles.rowCard}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="language-outline" size={20} color="#fbbf24" />
                  </View>
                  <Text style={styles.rowLabel}>{t("profile.language")}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.valueText}>
                    {user?.language === "en" ? "English" : "Русский"}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#52525b" />
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        </View>

        <PendingSubscriptions />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.account_section")}</Text>

          <TouchableOpacity onPress={() => navigation.navigate("Friends")}>
            <GlassCard style={styles.rowCard}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="people-outline" size={20} color="#fbbf24" />
                  </View>
                  <Text style={styles.rowLabel}>{t("profile.friends")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#52525b" />
              </View>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
            <GlassCard style={styles.rowCard}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="notifications-outline" size={20} color="#fbbf24" />
                  </View>
                  <Text style={styles.rowLabel}>{t("profile.notifications")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#52525b" />
              </View>
            </GlassCard>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t("profile.sign_out")}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t("profile.version")}</Text>
      </ScrollView>

      {/* Edit Name Modal */}
      <GlassModal
        isOpen={isEditNameOpen}
        onClose={() => setIsEditNameOpen(false)}
        title={t("profile.edit_name")}
        footer={
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditNameOpen(false)}>
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateName}
              disabled={updateProfileMutation.isPending}
            >
              <Text style={styles.saveButtonText}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t("profile.display_name")}</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t("profile.enter_name")}
            placeholderTextColor="#71717a"
            autoFocus
          />
        </View>
      </GlassModal>

      {/* Currency Picker Modal */}
      <GlassModal
        isOpen={isCurrencyPickerOpen}
        onClose={() => setIsCurrencyPickerOpen(false)}
        title={t("profile.select_currency")}
      >
        <View style={styles.pickerContainer}>
          {[
            { code: "USD", label: "US Dollar (USD)" },
            { code: "EUR", label: "Euro (EUR)" },
            { code: "RUB", label: "Russian Ruble (RUB)" },
          ].map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[styles.pickerOption, user?.currency === c.code && styles.pickerOptionActive]}
              onPress={() => handleCurrencySelect(c.code)}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  user?.currency === c.code && styles.pickerOptionTextActive,
                ]}
              >
                {c.label}
              </Text>
              {user?.currency === c.code && <Ionicons name="checkmark" size={24} color="#fbbf24" />}
            </TouchableOpacity>
          ))}
        </View>
      </GlassModal>

      {/* Language Picker Modal */}
      <GlassModal
        isOpen={isLanguagePickerOpen}
        onClose={() => setIsLanguagePickerOpen(false)}
        title={t("profile.select_language")}
      >
        <View style={styles.pickerContainer}>
          {[
            { code: "en", label: "English" },
            { code: "ru", label: "Русский" },
          ].map((l) => (
            <TouchableOpacity
              key={l.code}
              style={[styles.pickerOption, user?.language === l.code && styles.pickerOptionActive]}
              onPress={() => handleLanguageSelect(l.code)}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  user?.language === l.code && styles.pickerOptionTextActive,
                ]}
              >
                {l.label}
              </Text>
              {user?.language === l.code && <Ionicons name="checkmark" size={24} color="#fbbf24" />}
            </TouchableOpacity>
          ))}
        </View>
      </GlassModal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing["2xl"],
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["4xl"],
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.lg,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  name: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: fontSize.base,
    color: colors.text.quaternary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing["3xl"],
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: "rgba(255,255,255,0.35)",
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  rowCard: {
    marginBottom: spacing.sm + 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.accent.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  valueText: {
    color: colors.text.tertiary,
    fontSize: fontSize.base,
  },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    padding: spacing.lg,
    borderRadius: radius.xl,
    alignItems: "center",
    marginBottom: spacing["2xl"],
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  logoutText: {
    color: colors.status.error,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
  },
  version: {
    textAlign: "center",
    color: colors.border.secondary,
    fontSize: fontSize.sm,
  },
  // Modal
  modalFooter: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
  saveButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.primary,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#000",
    fontWeight: fontWeight.semibold,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    fontWeight: fontWeight.medium,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.md,
  },
  // Picker
  pickerContainer: {
    gap: spacing.sm,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  pickerOptionActive: {
    backgroundColor: "rgba(251, 191, 36, 0.08)",
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  pickerOptionText: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
    fontWeight: fontWeight.medium,
  },
  pickerOptionTextActive: {
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
  },
})
