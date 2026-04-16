import { CHANGELOG, TERMS_VERSION } from "@/constants/AppVersions"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { getAcceptedTermsVersion, getLastSeenVersion, setAcceptedTermsVersion, setLastSeenVersion } from "@/lib/versionCheck"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import Constants from "expo-constants"
import { useEffect, useState } from "react"
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { sheetSectionStyles } from "./sheet-modal"

const TERMS_SECTION_ICONS = {
  storage: "smartphone",
  responsibility: "alert-triangle",
  security: "lock",
  usage: "check-circle",
  privacy: "shield",
  limitation: "info",
  evolution: "zap",
} as const

type Step = "changelog" | "terms" | null

export function AppUpdateModals() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { user, deleteAccount } = useAuthStore()
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState<Step>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingSteps, setPendingSteps] = useState<Step[]>([])

  const appVersion = Constants.expoConfig?.version ?? "0.0.0"
  const language = (user?.settings?.language ?? "en") as keyof (typeof CHANGELOG)[string]

  useEffect(() => {
    if (!user) return
    checkForUpdates()
  }, [user])

  const checkForUpdates = async () => {
    const lastSeen = await getLastSeenVersion()
    const acceptedTerms = await getAcceptedTermsVersion()

    const steps: Step[] = []

    // Show changelog if this version has entries and hasn't been seen yet
    if (appVersion !== lastSeen && CHANGELOG[appVersion]) {
      steps.push("changelog")
    }

    // Show T&C update if terms version has changed
    if (acceptedTerms !== TERMS_VERSION) {
      steps.push("terms")
    }

    if (steps.length > 0) {
      setPendingSteps(steps)
      setStep(steps[0])
    }
  }

  const advanceStep = () => {
    const remaining = pendingSteps.slice(1)
    setPendingSteps(remaining)
    setStep(remaining[0] ?? null)
  }

  const handleChangelogDismiss = async () => {
    await setLastSeenVersion(appVersion)
    advanceStep()
  }

  const handleTermsAccept = async () => {
    await setAcceptedTermsVersion(TERMS_VERSION)
    advanceStep()
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    await deleteAccount()
    setDeleteLoading(false)
    setShowDeleteConfirm(false)
    setStep(null)
  }

  const entries: string[] = step === "changelog" && CHANGELOG[appVersion]
    ? (CHANGELOG[appVersion][language] ?? CHANGELOG[appVersion].en)
    : []

  if (!step) return null

  return (
    <Modal visible animationType="slide" transparent statusBarTranslucent>
      <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
        <View style={[styles.card, { backgroundColor: colors.background.primary }]}>

          {/* ── CHANGELOG STEP ── */}
          {step === "changelog" && (
            <>
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.title, { color: colors.foreground.primary }]}>
                    {t("changelog.title")}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.muted.foreground }]}>
                    {t("changelog.subtitle")}
                  </Text>
                </View>
                <View style={[styles.versionBadge, { backgroundColor: colors.primary.default + "20" }]}>
                  <Text style={[styles.versionText, { color: colors.primary.default }]}>
                    v{appVersion}
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {entries.map((entry, i) => (
                  <View key={i} style={styles.entryRow}>
                    <View style={[styles.entryDot, { backgroundColor: colors.primary.default }]} />
                    <Text style={[styles.entryText, { color: colors.foreground.primary }]}>{entry}</Text>
                  </View>
                ))}
                <View style={{ height: 16 }} />
              </ScrollView>

              <Pressable
                onPress={handleChangelogDismiss}
                style={[styles.primaryBtn, { backgroundColor: colors.primary.default }]}
              >
                <Text style={[styles.primaryBtnText, { color: colors.primary.foreground }]}>
                  {t("changelog.gotIt")}
                </Text>
              </Pressable>
            </>
          )}

          {/* ── TERMS UPDATE STEP ── */}
          {step === "terms" && !showDeleteConfirm && (
            <>
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.foreground.primary }]}>
                    {t("termsUpdate.title")}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.muted.foreground }]}>
                    {t("termsUpdate.message")}
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                {(Object.keys(TERMS_SECTION_ICONS) as (keyof typeof TERMS_SECTION_ICONS)[]).map((section) => (
                  <View key={section} style={sheetSectionStyles.section}>
                    <View style={sheetSectionStyles.sectionHeader}>
                      <Feather name={TERMS_SECTION_ICONS[section]} size={14} color={colors.primary.default} />
                      <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>
                        {t(`terms.sections.${section}.title` as any)}
                      </Text>
                    </View>
                    <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>
                      {t(`terms.sections.${section}.content` as any)}
                    </Text>
                  </View>
                ))}
                <View style={{ height: 8 }} />
              </ScrollView>

              <View style={styles.termsActions}>
                <Pressable
                  onPress={handleTermsAccept}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary.default, flex: 1 }]}
                >
                  <Text style={[styles.primaryBtnText, { color: colors.primary.foreground }]}>
                    {t("termsUpdate.accept")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowDeleteConfirm(true)}
                  style={[styles.secondaryBtn, { borderColor: colors.status.destructive, flex: 1 }]}
                >
                  <Text style={[styles.secondaryBtnText, { color: colors.status.destructive }]}>
                    {t("termsUpdate.deleteAccount")}
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* ── DELETE CONFIRM ── */}
          {step === "terms" && showDeleteConfirm && (
            <View style={styles.confirmContent}>
              <View style={[styles.confirmIcon, { backgroundColor: colors.status.destructive + "15" }]}>
                <Feather name="alert-triangle" size={32} color={colors.status.destructive} />
              </View>
              <Text style={[styles.confirmTitle, { color: colors.foreground.primary }]}>
                {t("termsUpdate.deleteConfirmTitle")}
              </Text>
              <Text style={[styles.confirmMessage, { color: colors.muted.foreground }]}>
                {t("termsUpdate.deleteConfirmMessage")}
              </Text>
              <Pressable
                onPress={handleDeleteAccount}
                disabled={deleteLoading}
                style={[styles.primaryBtn, { backgroundColor: colors.status.destructive, opacity: deleteLoading ? 0.7 : 1 }]}
              >
                {deleteLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={[styles.primaryBtnText, { color: "#fff" }]}>{t("termsUpdate.deleteConfirm")}</Text>
                }
              </Pressable>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={styles.backBtn}>
                <Feather name="arrow-left" size={15} color={colors.muted.foreground} />
                <Text style={[styles.backBtnText, { color: colors.muted.foreground }]}>{t("common.back")}</Text>
              </Pressable>
            </View>
          )}

        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  card: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%", paddingBottom: 16 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, gap: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  versionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  versionText: { fontSize: 12, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, maxHeight: 380 },
  entryRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 14 },
  entryDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  entryText: { flex: 1, fontSize: 14, lineHeight: 20 },
  primaryBtn: { marginHorizontal: 20, marginTop: 12, padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { fontWeight: "700", fontSize: 15 },
  termsActions: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 12 },
  secondaryBtn: { padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  secondaryBtnText: { fontWeight: "600", fontSize: 14 },
  confirmContent: { padding: 24, alignItems: "center", gap: 12 },
  confirmIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  confirmTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  confirmMessage: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, padding: 8 },
  backBtnText: { fontSize: 14 },
})
