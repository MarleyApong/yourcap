import { useTheme } from "@/core/theme"
import { useSettings } from "@/hooks/useSettings"
import { useTranslation } from "@/i18n"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated"
import { Feather } from "@expo/vector-icons"

const DISMISSED_KEY = "notif_prompt_dismissed"

export function NotificationBanner() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { settings } = useSettings()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    checkShouldShow()
  }, [settings.notification_enabled])

  const checkShouldShow = async () => {
    const dismissed = await AsyncStorage.getItem(DISMISSED_KEY)
    if (dismissed === "1") return

    const { status } = await Notifications.getPermissionsAsync()
    const notifOff = !settings.notification_enabled || status !== "granted"
    setVisible(notifOff)
  }

  const handleDismiss = async () => {
    await AsyncStorage.setItem(DISMISSED_KEY, "1")
    setVisible(false)
  }

  const handleEnable = () => {
    router.push("/settings/notifications")
  }

  if (!visible) return null

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.banner, { backgroundColor: colors.status.warning + "18", borderColor: colors.status.warning + "40" }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.status.warning + "25" }]}>
        <Feather name="bell-off" size={16} color={colors.status.warning} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.foreground.primary }]}>{t("notifBanner.title")}</Text>
        <Text style={[styles.desc, { color: colors.muted.foreground }]}>{t("notifBanner.desc")}</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={handleEnable}
            style={[styles.enableBtn, { backgroundColor: colors.status.warning }]}
          >
            <Text style={[styles.enableText, { color: "#fff" }]}>{t("notifBanner.enable")}</Text>
          </Pressable>
          <Pressable onPress={handleDismiss}>
            <Text style={[styles.dismissText, { color: colors.muted.foreground }]}>{t("notifBanner.dismiss")}</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 14, gap: 12, marginBottom: 20, alignItems: "flex-start" },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  textWrap: { flex: 1 },
  title: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  desc: { fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 },
  enableBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  enableText: { fontSize: 12, fontWeight: "700" },
  dismissText: { fontSize: 12 },
})
