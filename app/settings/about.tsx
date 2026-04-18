import { ImportExportSection } from "@/components/feature/import-export-section"
import { PageHeader } from "@/components/feature/page-header"
import { SheetModal, sheetSectionStyles } from "@/components/feature/sheet-modal"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { useState } from "react"
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const TERMS_ICONS = {
  storage: "smartphone",
  responsibility: "alert-triangle",
  security: "lock",
  usage: "check-circle",
  privacy: "shield",
  limitation: "info",
  evolution: "zap",
} as const

export default function AboutSettings() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const insets = useSafeAreaInsets()

  const [termsVisible, setTermsVisible] = useState(false)
  const [privacyVisible, setPrivacyVisible] = useState(false)
  const [helpVisible, setHelpVisible] = useState(false)

  const Row = ({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) => (
    <Pressable onPress={onPress} style={[styles.row, { borderTopColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary.default }]}>
          <Feather name={icon as any} size={18} color={colors.primary.foreground} />
        </View>
        <Text style={[styles.rowText, { color: colors.foreground.primary }]}>{title}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.muted.foreground} />
    </Pressable>
  )

  return (
    <>
      <ScrollView style={[styles.scroll, { backgroundColor: colors.background.primary }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <PageHeader title={t("settings.about")} textPosition="center" textAlign="left" />

        <View style={styles.content}>
          {/* Support */}
          <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t("settings.supportTitle")}</Text>
            <Text style={[styles.cardDesc, { color: colors.muted.foreground }]}>{t("settings.supportDesc")}</Text>
            <Pressable
              onPress={() => Linking.openURL("https://ko-fi.com/marleyapong")}
              style={({ pressed }) => [styles.kofiBtn, { borderColor: colors.primary.default, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={{ color: colors.primary.default, fontWeight: "600", fontSize: 14 }}>{t("settings.supportKofi")}</Text>
            </Pressable>
          </View>

          {/* Data */}
          <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t("settings.data")}</Text>
            <ImportExportSection
              userId={user?.user_id || ""}
              onImportComplete={(imported, total) => Toast.success(`${imported}/${total} ${t("settings.debtsImported")}`)}
            />
          </View>

          {/* About links */}
          <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground.primary }]}>{t("settings.about")}</Text>
            <Row icon="file-text" title={t("settings.termsOfServiceTitle")} onPress={() => setTermsVisible(true)} />
            <Row icon="shield" title={t("settings.privacyPolicyTitle")} onPress={() => setPrivacyVisible(true)} />
            <Row icon="help-circle" title={t("settings.helpSupportTitle")} onPress={() => setHelpVisible(true)} />
          </View>
        </View>
      </ScrollView>

      {/* Terms modal */}
      <SheetModal visible={termsVisible} onClose={() => setTermsVisible(false)} title={t("terms.title")} actionLabel={t("settings.iUnderstand")}>
        <Text style={[sheetSectionStyles.sectionContent, { color: colors.muted.foreground, paddingTop: 8, marginBottom: 4 }]}>{t("terms.lastUpdated")}</Text>
        {(Object.keys(TERMS_ICONS) as (keyof typeof TERMS_ICONS)[]).map((section) => (
          <View key={section} style={sheetSectionStyles.section}>
            <View style={sheetSectionStyles.sectionHeader}>
              <Feather name={TERMS_ICONS[section]} size={15} color={colors.primary.default} />
              <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>{t(`terms.sections.${section}.title` as any)}</Text>
            </View>
            <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t(`terms.sections.${section}.content` as any)}</Text>
          </View>
        ))}
      </SheetModal>

      {/* Privacy modal */}
      <SheetModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} title={t("settings.privacyPolicy")} actionLabel={t("settings.iUnderstand")}>
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="database" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>{t("settings.informationWeCollect")}</Text>
          </View>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.accountInfo")}</Text>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.debtRecords")}</Text>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.usageData")}</Text>
        </View>
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="eye" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>{t("settings.howWeUse")}</Text>
          </View>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.provideServices")}</Text>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.sendNotifications")}</Text>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.analytics")}</Text>
        </View>
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="shield" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>{t("settings.dataSecure")}</Text>
          </View>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.privacyImportant")}</Text>
        </View>
      </SheetModal>

      {/* Help modal */}
      <SheetModal visible={helpVisible} onClose={() => setHelpVisible(false)} title={t("settings.helpSupport")} actionLabel={t("settings.close")}>
        <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary, paddingTop: 12, marginBottom: 8 }]}>{t("settings.helpIntro")}</Text>
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="help-circle" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>{t("settings.faq")}</Text>
          </View>
          <Text style={[sheetSectionStyles.sectionTitle, { color: colors.foreground.primary, marginBottom: 4, fontWeight: "600" }]}>{t("settings.howToAddDebt")}</Text>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.howToAddDebtAnswer")}</Text>
          <Text style={[sheetSectionStyles.sectionTitle, { color: colors.foreground.primary, marginTop: 12, marginBottom: 4, fontWeight: "600" }]}>{t("settings.howToChangePin")}</Text>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>{t("settings.howToChangePinAnswer")}</Text>
        </View>
        <View style={sheetSectionStyles.section}>
          <View style={sheetSectionStyles.sectionHeader}>
            <Feather name="user" size={15} color={colors.primary.default} />
            <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>{t("settings.contactSupport")}</Text>
          </View>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary, fontWeight: "600" }]}>{t("settings.developerName")}</Text>
          <Pressable onPress={() => Linking.openURL("mailto:marlexapong90@gmail.com")}>
            <Text style={[sheetSectionStyles.sectionContent, { color: colors.primary.default, textDecorationLine: "underline" }]}>{t("settings.supportEmail")}</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL("https://mlya.me")}>
            <Text style={[sheetSectionStyles.sectionContent, { color: colors.primary.default, textDecorationLine: "underline" }]}>{t("settings.developerPortfolio")}</Text>
          </Pressable>
        </View>
      </SheetModal>
    </>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  cardDesc: { fontSize: 13, marginBottom: 12 },
  kofiBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1.5 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderTopWidth: 1 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox: { padding: 8, borderRadius: 999 },
  rowText: { fontSize: 15 },
})
