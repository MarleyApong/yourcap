import { PageHeader } from "@/components/feature/page-header"
import { SelectionButtons } from "@/components/ui/selection-buttons"
import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useSettings } from "@/hooks/useSettings"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { checkBiometricCapabilities, getBiometricDisplayName, BiometricCapabilities } from "@/services/biometricService"
import { useAuthStore } from "@/stores/authStore"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import * as LocalAuthentication from "expo-local-authentication"
import { useEffect, useState } from "react"
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function SecuritySettings() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { user, updateBiometricSetting, login } = useAuthStore()
  const { settings, updateSetting } = useSettings()
  const insets = useSafeAreaInsets()

  const [biometricCapabilities, setBiometricCapabilities] = useState<BiometricCapabilities | null>(null)
  const [disableAuthModalVisible, setDisableAuthModalVisible] = useState(false)
  const [disableAuthLoading, setDisableAuthLoading] = useState(false)

  useEffect(() => {
    checkBiometricCapabilities().then(setBiometricCapabilities)
  }, [])

  const requireAuth = settings.require_auth !== false
  const dimmed = !requireAuth

  const handleRequireAuthToggle = async (enabled: boolean) => {
    if (enabled) {
      await updateSetting("require_auth", true)
      Toast.success(t("settings.protectionEnabled"))
      return
    }
    Toast.confirm(
      t("settings.disableProtectionConfirm"),
      () => setDisableAuthModalVisible(true),
      { title: t("settings.disableProtectionTitle"), confirmText: t("common.confirm"), cancelText: t("common.cancel") },
    )
  }

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !biometricCapabilities?.isAvailable) {
      Toast.error("Biometric authentication is not available on this device", "Error")
      return
    }
    if (enabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("settings.biometricConfirm"),
        cancelLabel: t("common.cancel"),
        disableDeviceFallback: true,
      })
      if (!result.success) {
        if (result.error === "user_cancel" || result.error === "system_cancel") return
        Toast.confirm(
          t("settings.biometricPermissionDenied"),
          () => Linking.openSettings(),
          { title: t("settings.biometricPermissionTitle"), confirmText: t("settings.openSettings"), cancelText: t("common.cancel") },
        )
        return
      }
    }
    const success = await updateBiometricSetting(enabled)
    if (!success) Toast.error(t("auth.errors.biometricError"))
    else Toast.success(enabled ? t("settings.biometricEnabled") : t("settings.biometricDisabled"))
  }

  const handleDisableAuthPin = async (pin: string) => {
    if (!user) return
    setDisableAuthLoading(true)
    try {
      const identifier = user.email || user.phone_number
      const success = await login({ identifier, pin })
      if (success) {
        setDisableAuthModalVisible(false)
        await updateSetting("require_auth", false)
        Toast.success(t("settings.protectionDisabled"))
      } else {
        Toast.error(t("auth.login.invalidPin"))
      }
    } finally {
      setDisableAuthLoading(false)
    }
  }

  const handleDisableAuthBiometric = async () => {
    setDisableAuthLoading(true)
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("settings.verifyIdentity"),
        cancelLabel: t("common.cancel"),
        disableDeviceFallback: false,
      })
      if (result.success) {
        setDisableAuthModalVisible(false)
        await updateSetting("require_auth", false)
        Toast.success(t("settings.protectionDisabled"))
      }
    } finally {
      setDisableAuthLoading(false)
    }
  }

  return (
    <>
      <ScrollView style={[styles.scroll, { backgroundColor: colors.background.primary }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <PageHeader title={t("settings.security")} textPosition="center" textAlign="left" />

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
            {/* App protection toggle */}
            <View style={styles.switchRow}>
              <View style={styles.switchLeft}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary.default }]}>
                  <Feather name="shield" size={18} color={colors.primary.foreground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground.primary }}>{t("settings.requireAuth")}</Text>
                  <Text style={[styles.desc, { color: colors.muted.foreground }]}>{t("settings.requireAuthDesc")}</Text>
                </View>
              </View>
              <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: requireAuth ? colors.primary.default : colors.border }}>
                <Switch value={requireAuth} onValueChange={handleRequireAuthToggle} trackColor={{ false: colors.muted.default, true: colors.primary.default }} thumbColor={colors.card.background} />
              </View>
            </View>

            {dimmed && (
              <View style={[styles.hint, { backgroundColor: colors.muted.default + "40", borderColor: colors.border }]}>
                <Feather name="info" size={13} color={colors.muted.foreground} />
                <Text style={[styles.hintText, { color: colors.muted.foreground }]}>{t("settings.securityOptionsDisabledHint")}</Text>
              </View>
            )}

            {/* Biometric */}
            {biometricCapabilities?.isAvailable && (
              <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: colors.border, opacity: dimmed ? 0.4 : 1 }]} pointerEvents={dimmed ? "none" : "auto"}>
                <View style={styles.switchLeft}>
                  <View style={[styles.iconBox, { backgroundColor: colors.primary.default }]}>
                    <MaterialIcons
                      name={biometricCapabilities.biometryType === "face" ? "face" : biometricCapabilities.biometryType === "iris" ? "remove-red-eye" : "fingerprint"}
                      size={18}
                      color={colors.primary.foreground}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground.primary }}>{getBiometricDisplayName(biometricCapabilities.biometryType)}</Text>
                    <Text style={[styles.desc, { color: colors.muted.foreground }]}>
                      {t("settings.useBiometricToUnlock") || `Use ${getBiometricDisplayName(biometricCapabilities.biometryType).toLowerCase()} to unlock`}
                    </Text>
                  </View>
                </View>
                <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: user?.biometric_enabled ? colors.primary.default : colors.border }}>
                  <Switch value={user?.biometric_enabled || false} onValueChange={handleBiometricToggle} trackColor={{ false: colors.muted.default, true: colors.primary.default }} thumbColor={colors.card.background} />
                </View>
              </View>
            )}

            {/* Inactivity timeout */}
            <View style={[styles.section, { opacity: dimmed ? 0.4 : 1 }]} pointerEvents={dimmed ? "none" : "auto"}>
              <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{t("settings.autoLogout")}</Text>
              <SelectionButtons
                options={[
                  { value: 1, label: t("settings.oneMin") },
                  { value: 5, label: t("settings.fiveMin") },
                  { value: 15, label: t("settings.fifteenMin") },
                  { value: 30, label: t("settings.thirtyMin") },
                  { value: 60, label: t("settings.sixtyMin") },
                  { value: 120, label: t("settings.oneHundredTwentyMin") },
                ]}
                selectedValue={settings.inactivity_timeout}
                onSelect={(minutes) => updateSetting("inactivity_timeout", minutes)}
              />
            </View>

            {/* Background lock delay */}
            <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border, opacity: dimmed ? 0.4 : 1 }]} pointerEvents={dimmed ? "none" : "auto"}>
              <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{t("settings.backgroundLockDelay")}</Text>
              <SelectionButtons
                options={[
                  { value: 0, label: t("settings.lockImmediately") },
                  { value: 5, label: t("settings.lockFiveSeconds") },
                  { value: 10, label: t("settings.lockTenSeconds") },
                  { value: 30, label: t("settings.lockThirtySeconds") },
                  { value: 60, label: t("settings.lockOneMinute") },
                ]}
                selectedValue={settings.background_lock_delay ?? 5}
                onSelect={async (seconds) => {
                  const success = await updateSetting("background_lock_delay", seconds)
                  if (success) Toast.success(t("settings.backgroundLockDelayUpdated"))
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={disableAuthModalVisible} animationType="slide" presentationStyle="formSheet" statusBarTranslucent onRequestClose={() => setDisableAuthModalVisible(false)}>
        <View style={[styles.verifyModal, { backgroundColor: colors.background.primary }]}>
          <Pressable style={styles.verifyModalClose} onPress={() => setDisableAuthModalVisible(false)}>
            <Feather name="x" size={24} color={colors.foreground.primary} />
          </Pressable>
          <PinInput
            title={t("settings.verifyIdentity")}
            subtitle={t("settings.enterPinToDisable")}
            onComplete={handleDisableAuthPin}
            onBiometric={user?.biometric_enabled && biometricCapabilities?.isAvailable ? handleDisableAuthBiometric : undefined}
            biometricAvailable={!!(user?.biometric_enabled && biometricCapabilities?.isAvailable)}
            showBiometric={!!(user?.biometric_enabled && biometricCapabilities?.isAvailable)}
          />
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 24 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  switchLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  iconBox: { padding: 8, borderRadius: 999 },
  section: { paddingVertical: 12 },
  sectionLabel: { fontWeight: "500", marginBottom: 10 },
  desc: { fontSize: 13, marginTop: 2 },
  hint: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginVertical: 8 },
  hintText: { fontSize: 12, flex: 1 },
  verifyModal: { flex: 1, justifyContent: "center" },
  verifyModalClose: { position: "absolute", top: 56, right: 24, zIndex: 10 },
})
