import { LanguageSelector } from "@/components/feature/language-selector"
import { PageHeader } from "@/components/feature/page-header"
import { useTheme } from "@/core/theme"
import { useSettings } from "@/hooks/useSettings"
import { getTranslationFunction, useTranslation } from "@/i18n"
import { SupportedLanguage } from "@/i18n/locales"
import { Toast } from "@/lib/toast-global"
import { useLanguageStore } from "@/stores/languageStore"
import { ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function LanguageSettings() {
  const { colors } = useTheme()
  const { t, currentLanguage } = useTranslation()
  const { updateSetting } = useSettings()
  const { setAppLanguage } = useLanguageStore()
  const insets = useSafeAreaInsets()

  const handleLanguageChange = async (language: SupportedLanguage) => {
    await setAppLanguage(language)
    await updateSetting("language", language)
    const tNew = getTranslationFunction(language)
    Toast.success(tNew("settings.languageUpdated"))
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background.primary }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <PageHeader title={t("settings.language")} textPosition="center" textAlign="left" />
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
          <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
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
