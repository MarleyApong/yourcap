import { PageHeader } from "@/components/feature/page-header"
import { useAppStore } from "@/core/stores/appStore"
import { ACCENT_PRESETS } from "@/core/theme/colors"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Feather } from "@expo/vector-icons"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function AppearanceSettings() {
  const { colors, isDark, accentColor } = useTheme()
  const { themeMode, setThemeMode, setAccentColor } = useAppStore()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background.primary }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <PageHeader title={t("settings.appearance")} textPosition="center" textAlign="left" />

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{t("settings.themeMode")}</Text>
          <View style={styles.themeRow}>
            {(["light", "system", "dark"] as const).map((mode) => {
              const labels = { light: t("settings.themeLight"), system: t("settings.themeSystem"), dark: t("settings.themeDark") }
              const icons = { light: "sun", system: "monitor", dark: "moon" }
              const selected = themeMode === mode
              return (
                <Pressable
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[styles.themeBtn, { backgroundColor: selected ? colors.primary.default : colors.secondary.default, borderColor: selected ? colors.primary.default : colors.border }]}
                >
                  <Feather name={icons[mode] as any} size={16} color={selected ? colors.primary.foreground : colors.muted.foreground} />
                  <Text style={[styles.themeBtnText, { color: selected ? colors.primary.foreground : colors.foreground.primary }]}>{labels[mode]}</Text>
                </Pressable>
              )
            })}
          </View>

          <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{t("settings.accentColor")}</Text>
            <View style={styles.accentRow}>
              {(["purple", "blue", "green", "orange", "rose", "teal"] as const).map((accent) => {
                const accentNames = {
                  purple: t("settings.accentPurple"),
                  blue: t("settings.accentBlue"),
                  green: t("settings.accentGreen"),
                  orange: t("settings.accentOrange"),
                  rose: t("settings.accentRose"),
                  teal: t("settings.accentTeal"),
                }
                const dotColor = ACCENT_PRESETS[accent][isDark ? "dark" : "light"].primary
                const selected = accentColor === accent
                return (
                  <Pressable key={accent} onPress={() => setAccentColor(accent)} style={styles.accentItem}>
                    <View style={[styles.accentDot, { backgroundColor: dotColor, borderWidth: selected ? 3 : 0, borderColor: colors.foreground.primary }]} />
                    <Text style={[styles.accentLabel, { color: selected ? colors.primary.default : colors.muted.foreground }]}>{accentNames[accent]}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 24 },
  sectionLabel: { fontWeight: "500", marginBottom: 12 },
  section: { paddingTop: 16 },
  themeRow: { flexDirection: "row", gap: 8 },
  themeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  themeBtnText: { fontSize: 13, fontWeight: "600" },
  accentRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingTop: 4 },
  accentItem: { alignItems: "center", gap: 6, minWidth: 52 },
  accentDot: { width: 32, height: 32, borderRadius: 16 },
  accentLabel: { fontSize: 11, fontWeight: "500" },
})
