import { ChangePinModal } from "@/components/feature/change-pin-modal"
import { EditProfileModal } from "@/components/feature/edit-profile-modal"
import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { useTheme } from "@/core/theme"
import { useSettings } from "@/hooks/useSettings"
import { useTranslation } from "@/i18n"
import { supportedLanguages } from "@/i18n/locales"
import { Toast } from "@/lib/toast-global"
import { scheduleAllDebtReminders } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Settings() {
  const { user, logout } = useAuthStore()
  const { settings, loading, updateSetting } = useSettings()
  const { colors } = useTheme()
  const { t, currentLanguage } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false)
  const [changePinModalVisible, setChangePinModalVisible] = useState(false)

  const handleLogout = () => {
    Toast.confirm(
      t("settings.logoutConfirm"),
      () => { logout(); router.replace("/") },
      { title: t("settings.logoutTitle"), confirmText: t("settings.logOut"), cancelText: t("settings.logoutCancel") },
    )
  }

  const handleDeleteAccount = () => {
    Toast.confirm(
      t("settings.deleteAccountConfirm"),
      () => Toast.info(t("settings.accountDeletionSoon"), "Info"),
      { title: t("settings.deleteAccountTitle"), confirmText: t("settings.deleteAccountButton"), cancelText: t("settings.logoutCancel") },
    )
  }

  const MenuRow = ({ icon, title, value, onPress, isDanger = false, isFirst = false }: { icon: string; title: string; value?: string; onPress: () => void; isDanger?: boolean; isFirst?: boolean }) => (
    <Pressable
      onPress={onPress}
      style={[styles.menuRow, { borderTopWidth: isFirst ? 0 : 1, borderTopColor: isDanger ? colors.status.destructive + "20" : colors.border }]}
    >
      <View style={styles.menuRowLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDanger ? colors.status.destructive + "15" : colors.primary.default }]}>
          <Feather name={icon as any} size={18} color={isDanger ? colors.status.destructive : colors.primary.foreground} />
        </View>
        <Text style={[styles.menuRowText, { color: isDanger ? colors.status.destructive : colors.foreground.primary }]}>{title}</Text>
      </View>
      <View style={styles.menuRowRight}>
        {value && <Text style={[styles.menuRowValue, { color: colors.muted.foreground }]}>{value}</Text>}
        <Feather name="chevron-right" size={18} color={isDanger ? colors.status.destructive : colors.muted.foreground} />
      </View>
    </Pressable>
  )

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <LoadingState message={t("common.loading")} />
      </View>
    )
  }

  const languageName = supportedLanguages[currentLanguage]?.name ?? currentLanguage
  const notifValue = settings.notification_enabled ? t("common.on") || "On" : t("common.off") || "Off"
  const securityValue = settings.require_auth !== false ? t("settings.protected") || "Protected" : t("settings.disabled") || "Disabled"

  return (
    <>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background.primary }]}
        contentContainerStyle={{ paddingBottom: Math.max(40, insets.bottom + 80) }}
      >
        <PageHeader title={t("settings.title")} textPosition="center" textAlign="left" />

        <View style={styles.content}>
          {/* Profile */}
          <Animated.View entering={FadeInDown.duration(300).delay(50)} style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <View style={styles.profileRow}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary.default }]}>
                <Feather name="user" size={24} color={colors.primary.foreground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileName, { color: colors.foreground.primary }]}>{user?.full_name}</Text>
                <Text style={[styles.profileEmail, { color: colors.muted.foreground }]}>{user?.email || user?.phone_number}</Text>
              </View>
            </View>
            <MenuRow isFirst icon="edit" title={t("settings.editProfile")} onPress={() => setEditProfileModalVisible(true)} />
            <MenuRow icon="lock" title={t("settings.changePin")} onPress={() => setChangePinModalVisible(true)} />
          </Animated.View>

          {/* Settings menu */}
          <Animated.View entering={FadeInDown.duration(300).delay(150)} style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <MenuRow isFirst icon="bell" title={t("settings.notifications")} value={notifValue} onPress={() => router.push("/settings/notifications")} />
            <MenuRow icon="shield" title={t("settings.security")} value={securityValue} onPress={() => router.push("/settings/security")} />
            <MenuRow icon="clock" title={t("settings.sessionManagement")} onPress={() => router.push("/settings/session")} />
            <MenuRow icon="globe" title={t("settings.language")} value={languageName} onPress={() => router.push("/settings/language")} />
            <MenuRow icon="sun" title={t("settings.appearance")} onPress={() => router.push("/settings/appearance")} />
            <MenuRow icon="database" title={t("settings.data")} onPress={() => router.push("/settings/data")} />
            <MenuRow icon="info" title={t("settings.about")} onPress={() => router.push("/settings/about")} />
          </Animated.View>

          {/* Dev tools */}
          {__DEV__ && (
            <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t("settings.developmentTools")}</Text>
              <MenuRow
                isFirst
                icon="bell"
                title={t("settings.testSummaryNotification")}
                onPress={async () => {
                  if (user?.user_id) {
                    const { updateSummaryNotificationContent } = await import("@/services/notificationService")
                    await updateSummaryNotificationContent(user.user_id)
                    Toast.success(t("settings.testNotificationSent"))
                  }
                }}
              />
              <MenuRow
                icon="refresh-cw"
                title={t("settings.rescheduleNotifications")}
                onPress={async () => {
                  if (user?.user_id) {
                    await scheduleAllDebtReminders(user.user_id)
                    Toast.success(t("settings.notificationsRescheduled"))
                  }
                }}
              />
            </View>
          )}

          {/* Danger Zone */}
          <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.status.destructive }]}>
            <Text style={[styles.cardTitle, { color: colors.status.destructive }]}>{t("settings.dangerZone")}</Text>
            <MenuRow isFirst icon="trash-2" title={t("settings.deleteAccount")} onPress={handleDeleteAccount} isDanger />
            <Pressable
              onPress={handleLogout}
              style={[styles.logoutBtn, { backgroundColor: colors.status.destructive }]}
            >
              <Feather name="log-out" size={20} color={colors.status.destructiveForeground} />
              <Text style={[styles.logoutBtnText, { color: colors.status.destructiveForeground }]}>{t("settings.logOut")}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <EditProfileModal visible={editProfileModalVisible} onClose={() => setEditProfileModalVisible(false)} />
      <ChangePinModal visible={changePinModalVisible} onClose={() => setChangePinModalVisible(false)} />
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 16, marginTop: 18 },
  card: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 8 },
  profileAvatar: { padding: 12, borderRadius: 999 },
  profileName: { fontSize: 17, fontWeight: "600" },
  profileEmail: { fontSize: 13, marginTop: 2 },
  menuRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderTopWidth: 1 },
  menuRowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  menuRowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  menuRowValue: { fontSize: 13 },
  menuRowText: { fontSize: 15 },
  iconBox: { padding: 8, borderRadius: 999 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 8, marginTop: 12, marginBottom: 8 },
  logoutBtnText: { fontWeight: "600", fontSize: 15 },
})
