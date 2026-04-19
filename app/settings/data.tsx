import { ImportExportSection } from "@/components/feature/import-export-section"
import { PageHeader } from "@/components/feature/page-header"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { useAuthStore } from "@/stores/authStore"
import { ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function DataSettings() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background.primary }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <PageHeader title={t("settings.data")} textPosition="center" textAlign="left" />
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
          <ImportExportSection
            userId={user?.user_id || ""}
            onImportComplete={(imported, total) => Toast.success(`${imported}/${total} ${t("settings.debtsImported")}`)}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 24 },
})
