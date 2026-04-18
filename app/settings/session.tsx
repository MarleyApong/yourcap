import { PageHeader } from "@/components/feature/page-header"
import { SelectionButtons } from "@/components/ui/selection-buttons"
import { useTheme } from "@/core/theme"
import { useSettings } from "@/hooks/useSettings"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function SessionSettings() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { settings, updateSetting } = useSettings()
  const insets = useSafeAreaInsets()

  const handleRememberSessionToggle = async (enabled: boolean) => {
    await updateSetting("remember_session", enabled)
    if (!enabled) {
      const { clearSessionExpiry } = await import("@/lib/auth")
      await clearSessionExpiry()
    }
  }

  const handleSessionDurationChange = async (hours: number) => {
    const minutes = hours * 60
    const success = await updateSetting("session_duration", minutes)
    if (success && settings.remember_session) {
      const { setSessionExpiry } = await import("@/lib/auth")
      await setSessionExpiry()
      Toast.success(t("settings.sessionDuration"))
    }
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background.primary }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <PageHeader title={t("settings.sessionManagement")} textPosition="center" textAlign="left" />

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground.primary }}>{t("settings.rememberMe")}</Text>
              <Text style={[styles.desc, { color: colors.muted.foreground }]}>{t("settings.rememberMeDescription")}</Text>
            </View>
            <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: settings.remember_session ? colors.primary.default : colors.border }}>
              <Switch value={settings.remember_session} onValueChange={handleRememberSessionToggle} trackColor={{ false: colors.muted.default, true: colors.primary.default }} thumbColor={colors.card.background} />
            </View>
          </View>

          {settings.remember_session && (
            <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{t("settings.sessionDuration")}</Text>
              <SelectionButtons
                options={[
                  { value: 24, label: t("settings.twentyFourHours") },
                  { value: 168, label: t("settings.sevenDays") },
                  { value: 720, label: t("settings.oneMonth") },
                  { value: 1440, label: t("settings.twoMonths") },
                ]}
                selectedValue={settings.session_duration / 60}
                onSelect={handleSessionDurationChange}
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 24 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  section: { paddingTop: 12 },
  sectionLabel: { fontWeight: "500", marginBottom: 10 },
  desc: { fontSize: 13, marginTop: 2 },
})
