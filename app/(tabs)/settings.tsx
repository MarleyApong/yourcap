import { ChangePinModal } from "@/components/feature/change-pin-modal"
import PinInput from "@/components/ui/pin-input"
import { EditProfileModal } from "@/components/feature/edit-profile-modal"
import { ImportExportSection } from "@/components/feature/import-export-section"
import { LanguageSelector } from "@/components/feature/language-selector"
import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { SheetModal, sheetSectionStyles } from "@/components/feature/sheet-modal"
import { useAppStore } from "@/core/stores/appStore"
import { ACCENT_PRESETS } from "@/core/theme/colors"
import { useTheme } from "@/core/theme"
import { useSettings } from "@/hooks/useSettings"
import { useTranslation } from "@/i18n"
import { SupportedLanguage } from "@/i18n/locales"
import { Toast } from "@/lib/toast-global"
import { BiometricCapabilities, checkBiometricCapabilities, getBiometricDisplayName } from "@/services/biometricService"
import { requestNotificationPermissions, scheduleAllDebtReminders, updateNotificationSettings } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"
import { useLanguageStore } from "@/stores/languageStore"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import * as LocalAuthentication from "expo-local-authentication"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native"
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

export default function Settings() {
  const { user, logout, updateBiometricSetting, login } = useAuthStore()
  const { settings, loading, updateSetting } = useSettings()
  const { colors, isDark, accentColor } = useTheme()
  const { themeMode, setThemeMode, setAccentColor } = useAppStore()
  const { t, currentLanguage } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [localBiometricCapabilities, setLocalBiometricCapabilities] = useState<BiometricCapabilities | null>(null)
  const [termsModalVisible, setTermsModalVisible] = useState(false)
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false)
  const [changePinModalVisible, setChangePinModalVisible] = useState(false)
  const [disableAuthModalVisible, setDisableAuthModalVisible] = useState(false)
  const [disableAuthLoading, setDisableAuthLoading] = useState(false)

  useEffect(() => {
    const checkCapabilities = async () => {
      const capabilities = await checkBiometricCapabilities()
      setLocalBiometricCapabilities(capabilities)
    }
    checkCapabilities()
  }, [])

  const handleLogout = () => {
    Toast.confirm(
      t("settings.logoutConfirm"),
      () => {
        logout()
        router.replace("/")
      },
      {
        title: t("settings.logoutTitle"),
        confirmText: t("settings.logOut"),
        cancelText: t("settings.logoutCancel"),
      },
    )
  }

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !localBiometricCapabilities?.isAvailable) {
      Toast.error("Biometric authentication is not available on this device", "Error")
      return
    }

    if (enabled) {
      // Vérifie que la permission Face ID / biométrie est accordée
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirmer pour activer la biométrie",
        cancelLabel: "Annuler",
        disableDeviceFallback: true,
      })

      if (!result.success) {
        if (result.error === "user_cancel" || result.error === "system_cancel") {
          return // L'user a annulé — on ne fait rien
        }
        // Permission refusée ou non disponible → proposer les réglages
        Toast.confirm(
          "La permission biométrique a été refusée. Activez-la dans les réglages de votre téléphone.",
          () => Linking.openSettings(),
          {
            title: "Permission requise",
            confirmText: "Ouvrir les réglages",
            cancelText: "Annuler",
          },
        )
        return
      }
    }

    const success = await updateBiometricSetting(enabled)
    if (!success) {
      Toast.error("Failed to update biometric setting", "Error")
    } else {
      Toast.success(enabled ? "Biométrie activée" : "Biométrie désactivée")
    }
  }

  const handleRequireAuthToggle = async (enabled: boolean) => {
    if (enabled) {
      // Re-enabling: just save, no verification needed
      await updateSetting("require_auth", true)
      Toast.success(t("settings.protectionEnabled"))
      return
    }
    // Disabling: show confirmation toast then open verification modal
    Toast.confirm(
      t("settings.disableProtectionConfirm"),
      () => setDisableAuthModalVisible(true),
      {
        title: t("settings.disableProtectionTitle"),
        confirmText: t("common.confirm"),
        cancelText: t("common.cancel"),
      },
    )
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

    if (success) {
      if (settings.remember_session) {
        const { setSessionExpiry } = await import("@/lib/auth")
        await setSessionExpiry()
      }
      Toast.success("Session duration updated", "Success")
    }
  }

  const { setAppLanguage } = useLanguageStore()

  const handleLanguageChange = async (language: SupportedLanguage) => {
    // Update immediately in languageStore so UI updates right away
    await setAppLanguage(language)
    // Persist to DB
    await updateSetting("language", language)
    Toast.success(t("settings.selectLanguage"))
  }

  const [privacyModalVisible, setPrivacyModalVisible] = useState(false)
  const [helpModalVisible, setHelpModalVisible] = useState(false)

  const handleDeleteAccount = () => {
    Toast.confirm(
      t("settings.deleteAccountConfirm"),
      () => {
        Toast.info(t("settings.accountDeletionSoon"), "Info")
      },
      {
        title: t("settings.deleteAccountTitle"),
        confirmText: t("settings.deleteAccountButton"),
        cancelText: t("settings.logoutCancel"),
      },
    )
  }

  const SettingCard = ({ title, children, isDanger = false }: { title: string; children: React.ReactNode; isDanger?: boolean }) => (
    <View
      style={[
        styles.settingCard,
        {
          backgroundColor: colors.card.background,
          borderColor: isDanger ? colors.status.destructive : colors.border,
        },
      ]}
    >
      <Text style={[styles.settingCardTitle, { color: isDanger ? colors.status.destructive : colors.foreground.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  )

  const SettingRow = ({
    icon,
    title,
    onPress,
    showChevron = true,
    isDanger = false,
  }: {
    icon?: string
    title: string
    onPress?: () => void
    showChevron?: boolean
    isDanger?: boolean
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.settingRow,
        { borderTopColor: isDanger ? colors.status.destructive + "20" : colors.border },
      ]}
    >
      <View style={styles.settingRowLeft}>
        {icon && (
          <View
            style={[
              styles.settingRowIcon,
              { backgroundColor: isDanger ? colors.status.destructive + "15" : colors.primary.default },
            ]}
          >
            <Feather
              name={icon as any}
              size={20}
              color={isDanger ? colors.status.destructive : colors.primary.foreground}
            />
          </View>
        )}
        <Text style={[styles.settingRowText, { color: isDanger ? colors.status.destructive : colors.foreground.primary }]}>
          {title}
        </Text>
      </View>
      {showChevron && (
        <Feather
          name="chevron-right"
          size={20}
          color={isDanger ? colors.status.destructive : colors.muted.foreground}
        />
      )}
    </Pressable>
  )

  const SelectionButtons = ({
    options,
    selectedValue,
    onSelect,
  }: {
    options: { value: any; label: string }[]
    selectedValue: any
    onSelect: (value: any) => void
  }) => (
    <View style={styles.selectionButtons}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onSelect(option.value)}
          style={[
            styles.selectionBtn,
            {
              backgroundColor:
                selectedValue === option.value ? colors.primary.default : colors.secondary.default,
            },
          ]}
        >
          <Text
            style={[
              styles.selectionBtnText,
              {
                color:
                  selectedValue === option.value
                    ? colors.primary.foreground
                    : colors.secondary.foreground,
              },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )

  const MultipleTimeSelection = ({
    options,
    selectedValues,
    onSelectionChange,
  }: {
    options: { value: string; label: string }[]
    selectedValues: string[]
    onSelectionChange: (values: string[]) => void
  }) => {
    const toggleSelection = (value: string) => {
      let newSelection: string[]
      if (selectedValues.includes(value)) {
        if (selectedValues.length > 1) {
          newSelection = selectedValues.filter((v) => v !== value)
        } else {
          return
        }
      } else {
        newSelection = [...selectedValues, value]
      }
      onSelectionChange(newSelection)
    }

    return (
      <View style={styles.selectionButtons}>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value)
          return (
            <Pressable
              key={option.value}
              onPress={() => toggleSelection(option.value)}
              style={[
                styles.selectionBtn,
                {
                  backgroundColor: isSelected ? colors.primary.default : colors.secondary.default,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.primary.default : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.selectionBtnText,
                  { color: isSelected ? colors.primary.foreground : colors.secondary.foreground },
                ]}
              >
                {option.label}
                {isSelected && " ✓"}
              </Text>
            </Pressable>
          )
        })}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <LoadingState message="Loading settings..." />
      </View>
    )
  }

  return (
    <>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background.primary }]}
        contentContainerStyle={{ paddingBottom: Math.max(40, insets.bottom + 20) }}
      >
        <PageHeader title={t("settings.title")} textPosition="center" textAlign="left" />

        <View style={styles.content}>
          {/* Profile */}
          <SettingCard title={t("settings.profile")}>
            <View style={styles.profileRow}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary.default }]}>
                <Feather name="user" size={24} color={colors.primary.foreground} />
              </View>
              <View>
                <Text style={[styles.profileName, { color: colors.foreground.primary }]}>{user?.full_name}</Text>
                <Text style={[styles.profileEmail, { color: colors.muted.foreground }]}>{user?.email}</Text>
              </View>
            </View>

            <SettingRow icon="edit" title={t("settings.editProfile")} onPress={() => setEditProfileModalVisible(true)} />
            <SettingRow icon="lock" title={t("settings.changePin")} onPress={() => setChangePinModalVisible(true)} />
          </SettingCard>

          {/* Security */}
          {(() => {
            const requireAuth = settings.require_auth !== false
            const dimmed = !requireAuth
            const dimStyle = dimmed ? { opacity: 0.4 } : {}
            return (
              <SettingCard title={t("settings.security")}>
                {/* App Protection toggle — always active */}
                <View style={styles.switchRow}>
                  <View style={[styles.switchRowLeft, { flex: 1 }]}>
                    <View style={[styles.settingRowIcon, { backgroundColor: colors.primary.default }]}>
                      <Feather name="shield" size={20} color={colors.primary.foreground} />
                    </View>
                    <View style={[styles.switchRowText, { flex: 1 }]}>
                      <Text style={{ color: colors.foreground.primary }}>{t("settings.requireAuth")}</Text>
                      <Text style={[styles.switchRowDesc, { color: colors.muted.foreground }]}>{t("settings.requireAuthDesc")}</Text>
                    </View>
                  </View>
                  <Switch
                    value={requireAuth}
                    onValueChange={handleRequireAuthToggle}
                    trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                    thumbColor={colors.card.background}
                  />
                </View>

                {/* Hint when disabled */}
                {dimmed && (
                  <View style={[styles.disabledHint, { backgroundColor: colors.muted.default + "40", borderColor: colors.border }]}>
                    <Feather name="info" size={13} color={colors.muted.foreground} />
                    <Text style={[styles.disabledHintText, { color: colors.muted.foreground }]}>
                      {t("settings.securityOptionsDisabledHint")}
                    </Text>
                  </View>
                )}

                {/* Biometric */}
                {localBiometricCapabilities?.isAvailable && (
                  <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: colors.border }, dimStyle]}
                    pointerEvents={dimmed ? "none" : "auto"}>
                    <View style={styles.switchRowLeft}>
                      <View style={[styles.settingRowIcon, { backgroundColor: colors.primary.default }]}>
                        <MaterialIcons
                          name={
                            localBiometricCapabilities.biometryType === "face"
                              ? "face"
                              : localBiometricCapabilities.biometryType === "iris"
                              ? "remove-red-eye"
                              : "fingerprint"
                          }
                          size={20}
                          color={colors.primary.foreground}
                        />
                      </View>
                      <View style={styles.switchRowText}>
                        <Text style={{ color: colors.foreground.primary }}>
                          {getBiometricDisplayName(localBiometricCapabilities.biometryType)} Authentication
                        </Text>
                        <Text style={[styles.switchRowDesc, { color: colors.muted.foreground }]}>
                          Use {getBiometricDisplayName(localBiometricCapabilities.biometryType).toLowerCase()} to unlock
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={user?.biometric_enabled || false}
                      onValueChange={handleBiometricToggle}
                      trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                      thumbColor={colors.card.background}
                    />
                  </View>
                )}

                {/* Auto-logout */}
                <View
                  style={[
                    styles.settingSection,
                    { borderTopWidth: 1, borderTopColor: colors.border },
                    dimStyle,
                  ]}
                  pointerEvents={dimmed ? "none" : "auto"}
                >
                  <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.autoLogout")}</Text>
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
                <View
                  style={[styles.settingSection, { borderTopWidth: 1, borderTopColor: colors.border }, dimStyle]}
                  pointerEvents={dimmed ? "none" : "auto"}
                >
                  <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.backgroundLockDelay")}</Text>
                  <SelectionButtons
                    options={[
                      { value: 0, label: t("settings.lockImmediately") },
                      { value: 5, label: t("settings.lockFiveSeconds") },
                      { value: 10, label: t("settings.lockTenSeconds") },
                      { value: 30, label: t("settings.lockThirtySeconds") },
                      { value: 60, label: t("settings.lockOneMinute") },
                    ]}
                    selectedValue={settings.background_lock_delay || 5}
                    onSelect={(seconds) => updateSetting("background_lock_delay", seconds)}
                  />
                </View>
              </SettingCard>
            )
          })()}

          {/* Session Management */}
          <SettingCard title={t("settings.sessionManagement")}>
            <View style={styles.switchRow}>
              <View style={styles.switchRowText}>
                <Text style={{ color: colors.foreground.primary }}>{t("settings.rememberMe")}</Text>
                <Text style={[styles.switchRowDesc, { color: colors.muted.foreground }]}>{t("settings.rememberMeDescription")}</Text>
              </View>
              <Switch
                value={settings.remember_session}
                onValueChange={handleRememberSessionToggle}
                trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                thumbColor={colors.card.background}
              />
            </View>

            {settings.remember_session && (
              <View style={[styles.settingSection, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.sessionDuration")}</Text>
                <SelectionButtons
                  options={[
                    { value: 1, label: t("settings.oneHour") },
                    { value: 8, label: t("settings.eightHours") },
                    { value: 24, label: t("settings.twentyFourHours") },
                    { value: 168, label: t("settings.sevenDays") },
                  ]}
                  selectedValue={settings.session_duration / 60}
                  onSelect={handleSessionDurationChange}
                />
              </View>
            )}
          </SettingCard>

          {/* Notifications */}
          <SettingCard title={t("settings.notifications")}>
            <View style={styles.switchRow}>
              <Text style={{ color: colors.foreground.primary }}>{t("settings.enableNotifications")}</Text>
              <Switch
                value={settings.notification_enabled}
                onValueChange={async (val) => {
                  if (val) {
                    // Demander la permission AVANT de sauvegarder
                    const hasPermission = await requestNotificationPermissions()
                    if (!hasPermission) {
                      // Permission refusée — proposer d'ouvrir les réglages
                      Toast.confirm(
                        "Les notifications ont été refusées. Activez-les dans les réglages de votre téléphone.",
                        () => Linking.openSettings(),
                        {
                          title: "Permission requise",
                          confirmText: "Ouvrir les réglages",
                          cancelText: "Annuler",
                        },
                      )
                      return // Ne pas sauvegarder
                    }
                    await updateSetting("notification_enabled", true)
                    if (user?.user_id) {
                      await scheduleAllDebtReminders(user.user_id)
                    }
                    Toast.success(t("settings.notificationsEnabled"))
                  } else {
                    await updateSetting("notification_enabled", false)
                    const Notifications = await import("expo-notifications")
                    await Notifications.cancelAllScheduledNotificationsAsync()
                    Toast.success(t("settings.notificationsDisabled"))
                  }
                }}
                trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                thumbColor={colors.card.background}
              />
            </View>

            {settings.notification_enabled && (
              <>
                <View style={[styles.settingSection, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.notificationTypes")}</Text>

                  <View style={styles.switchRowCompact}>
                    <View style={styles.switchRowText}>
                      <Text style={{ color: colors.foreground.primary }}>{t("settings.systemNotifications")}</Text>
                      <Text style={[styles.switchRowDesc, { color: colors.muted.foreground }]}>{t("settings.systemNotificationsDesc")}</Text>
                    </View>
                    <Switch
                      value={settings.system_notifications}
                      onValueChange={async (val) => {
                        const success = await updateSetting("system_notifications", val)
                        if (success && user?.user_id) {
                          await updateNotificationSettings(user.user_id)
                          Toast.success(val ? t("settings.systemNotificationsEnabled") : t("settings.systemNotificationsDisabled"))
                        }
                      }}
                      trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                      thumbColor={colors.card.background}
                    />
                  </View>

                  <View style={styles.switchRowCompact}>
                    <View style={styles.switchRowText}>
                      <Text style={{ color: colors.foreground.primary }}>{t("settings.emailNotifications")}</Text>
                      <Text style={[styles.switchRowDesc, { color: colors.muted.foreground }]}>{t("settings.emailNotificationsDesc")}</Text>
                    </View>
                    <Switch
                      value={settings.email_notifications}
                      onValueChange={() => Toast.info(t("settings.emailComingSoon"))}
                      trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                      thumbColor={colors.card.background}
                    />
                  </View>

                  <View style={styles.switchRowCompact}>
                    <View style={styles.switchRowText}>
                      <Text style={{ color: colors.foreground.primary }}>{t("settings.smsNotifications")}</Text>
                      <Text style={[styles.switchRowDesc, { color: colors.muted.foreground }]}>{t("settings.smsNotificationsDesc")}</Text>
                    </View>
                    <Switch
                      value={settings.sms_notifications}
                      onValueChange={() => Toast.info(t("settings.smsComingSoon"))}
                      trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                      thumbColor={colors.card.background}
                    />
                  </View>
                </View>

                <View style={[styles.settingSection, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.daysBeforeReminder")}</Text>
                  <SelectionButtons
                    options={[
                      { value: 1, label: t("settings.oneDay") },
                      { value: 3, label: t("settings.threeDays") },
                      { value: 5, label: t("settings.fiveDays") },
                      { value: 7, label: t("settings.sevenDays") },
                    ]}
                    selectedValue={settings.days_before_reminder}
                    onSelect={async (days) => {
                      const success = await updateSetting("days_before_reminder", days)
                      if (success && user?.user_id) {
                        await scheduleAllDebtReminders(user.user_id)
                        Toast.success(t("settings.reminderScheduleUpdated"))
                      }
                    }}
                  />
                </View>

                <View style={[styles.settingSection, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.preferredNotificationTimes")}</Text>
                  <Text style={[styles.settingSectionDesc, { color: colors.muted.foreground }]}>{t("settings.selectMultipleTimes")}</Text>
                  <MultipleTimeSelection
                    options={[
                      { value: "05:00", label: t("settings.fiveAm") },
                      { value: "06:00", label: t("settings.sixAm") },
                      { value: "07:00", label: t("settings.sevenAm") },
                      { value: "08:00", label: t("settings.eightAm") },
                      { value: "09:00", label: t("settings.nineAm") },
                      { value: "12:00", label: t("settings.twelvePm") },
                      { value: "13:00", label: t("settings.onePm") },
                      { value: "14:00", label: t("settings.twoPm") },
                      { value: "15:00", label: t("settings.threePm") },
                      { value: "18:00", label: t("settings.sixPm") },
                      { value: "20:00", label: t("settings.eightPm") },
                    ]}
                    selectedValues={settings.notification_times || [settings.notification_time || "09:00"]}
                    onSelectionChange={async (times) => {
                      const success = await updateSetting("notification_times", times)
                      if (success && user?.user_id) {
                        await scheduleAllDebtReminders(user.user_id)
                        Toast.success(t("settings.notificationTimesUpdated"))
                      }
                    }}
                  />
                </View>

                <View style={[styles.settingSection, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <View style={styles.switchRowCompact}>
                    <View style={styles.switchRowText}>
                      <Text style={{ color: colors.foreground.primary }}>{t("settings.summaryNotifications")}</Text>
                      <Text style={[styles.switchRowDesc, { color: colors.muted.foreground }]}>{t("settings.summaryNotificationsDesc")}</Text>
                    </View>
                    <Switch
                      value={settings.summary_notifications}
                      onValueChange={async (val) => {
                        const success = await updateSetting("summary_notifications", val)
                        if (success && user?.user_id) {
                          await scheduleAllDebtReminders(user.user_id)
                          Toast.success(val ? t("settings.summaryNotificationsEnabled") : t("settings.summaryNotificationsDisabled"))
                        }
                      }}
                      trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                      thumbColor={colors.card.background}
                    />
                  </View>

                  {settings.summary_notifications && (
                    <>
                      <View style={styles.settingSection}>
                        <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.summaryFrequency")}</Text>
                        <SelectionButtons
                          options={[
                            { value: "daily", label: t("settings.daily") },
                            { value: "weekly", label: t("settings.weekly") },
                            { value: "none", label: t("common.none") },
                          ]}
                          selectedValue={settings.summary_frequency || "daily"}
                          onSelect={async (frequency) => {
                            const success = await updateSetting("summary_frequency", frequency)
                            if (success && user?.user_id) {
                              await scheduleAllDebtReminders(user.user_id)
                              Toast.success(t("settings.summaryFrequencyUpdated"))
                            }
                          }}
                        />
                      </View>

                      {settings.summary_frequency !== "none" && (
                        <View style={styles.settingSection}>
                          <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.summaryTime")}</Text>
                          <SelectionButtons
                            options={[
                              { value: "08:00", label: t("settings.eightAm") },
                              { value: "12:00", label: t("settings.twelvePm") },
                              { value: "18:00", label: t("settings.sixPm") },
                              { value: "20:00", label: t("settings.eightPm") },
                              { value: "21:00", label: t("settings.ninePm") },
                            ]}
                            selectedValue={settings.summary_notification_time || "20:00"}
                            onSelect={async (time) => {
                              const success = await updateSetting("summary_notification_time", time)
                              if (success && user?.user_id) {
                                await scheduleAllDebtReminders(user.user_id)
                                Toast.success(t("settings.summaryTimeUpdated"))
                              }
                            }}
                          />
                        </View>
                      )}
                    </>
                  )}
                </View>
              </>
            )}
          </SettingCard>

          {/* Language */}
          <SettingCard title={t("settings.language")}>
            <View style={styles.settingSection}>
              <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.selectLanguage")}</Text>
              <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
            </View>
          </SettingCard>

          {/* Appearance */}
          <SettingCard title={t("settings.appearance")}>
            {/* Theme mode */}
            <View style={styles.settingSection}>
              <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.themeMode")}</Text>
              <View style={styles.themeRow}>
                {(["light", "system", "dark"] as const).map((mode) => {
                  const labels = { light: t("settings.themeLight"), system: t("settings.themeSystem"), dark: t("settings.themeDark") }
                  const icons = { light: "sun", system: "monitor", dark: "moon" }
                  const selected = themeMode === mode
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setThemeMode(mode)}
                      style={[
                        styles.themeBtn,
                        { backgroundColor: selected ? colors.primary.default : colors.secondary.default, borderColor: selected ? colors.primary.default : colors.border },
                      ]}
                    >
                      <Feather name={icons[mode] as any} size={16} color={selected ? colors.primary.foreground : colors.muted.foreground} />
                      <Text style={[styles.themeBtnText, { color: selected ? colors.primary.foreground : colors.foreground.primary }]}>
                        {labels[mode]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {/* Accent color */}
            <View style={[styles.settingSection, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.settingSectionLabel, { color: colors.foreground.primary }]}>{t("settings.accentColor")}</Text>
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
                      <View style={[
                        styles.accentDot,
                        { backgroundColor: dotColor, borderWidth: selected ? 3 : 0, borderColor: colors.foreground.primary },
                      ]} />
                      <Text style={[styles.accentLabel, { color: selected ? colors.primary.default : colors.muted.foreground }]}>
                        {accentNames[accent]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </SettingCard>

          {/* Data */}
          <SettingCard title={t("settings.data")}>
            <ImportExportSection
              userId={user?.user_id || ""}
              onImportComplete={(imported, total) => {
                Toast.success(`${imported}/${total} ${t("settings.debtsImported")}`)
              }}
            />
          </SettingCard>

          {/* About */}
          <SettingCard title={t("settings.about")}>
            <SettingRow icon="file-text" title={t("settings.termsOfServiceTitle")} onPress={() => setTermsModalVisible(true)} />
            <SettingRow icon="shield" title={t("settings.privacyPolicyTitle")} onPress={() => setPrivacyModalVisible(true)} />
            <SettingRow icon="help-circle" title={t("settings.helpSupportTitle")} onPress={() => setHelpModalVisible(true)} />
          </SettingCard>

          {/* Dev Tools */}
          {__DEV__ && (
            <SettingCard title={t("settings.developmentTools")}>
              <SettingRow
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
              <SettingRow
                icon="refresh-cw"
                title={t("settings.rescheduleNotifications")}
                onPress={async () => {
                  if (user?.user_id) {
                    await scheduleAllDebtReminders(user.user_id)
                    Toast.success(t("settings.notificationsRescheduled"))
                  }
                }}
              />
            </SettingCard>
          )}

          {/* Danger Zone */}
          <SettingCard title={t("settings.dangerZone")} isDanger>
            <SettingRow icon="trash-2" title={t("settings.deleteAccount")} onPress={handleDeleteAccount} isDanger />

            <Pressable
              onPress={handleLogout}
              style={[
                styles.logoutBtn,
                {
                  backgroundColor: colors.status.destructive,
                  borderTopColor: colors.status.destructive + "20",
                },
              ]}
            >
              <Feather name="log-out" size={20} color={colors.status.destructiveForeground} />
              <Text style={[styles.logoutBtnText, { color: colors.status.destructiveForeground }]}>
                {t("settings.logOut")}
              </Text>
            </Pressable>
          </SettingCard>
        </View>
      </ScrollView>

      <SheetModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        title={t("terms.title")}
        actionLabel={t("settings.iUnderstand")}
      >
        <Text style={[sheetSectionStyles.sectionContent, { color: colors.muted.foreground, paddingTop: 8, marginBottom: 4 }]}>
          {t("terms.lastUpdated")}
        </Text>
        {(Object.keys(TERMS_ICONS) as (keyof typeof TERMS_ICONS)[]).map((section) => (
          <View key={section} style={sheetSectionStyles.section}>
            <View style={sheetSectionStyles.sectionHeader}>
              <Feather name={TERMS_ICONS[section]} size={15} color={colors.primary.default} />
              <Text style={[sheetSectionStyles.sectionTitle, { color: colors.primary.default }]}>
                {t(`terms.sections.${section}.title` as any)}
              </Text>
            </View>
            <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary }]}>
              {t(`terms.sections.${section}.content` as any)}
            </Text>
          </View>
        ))}
      </SheetModal>

      <SheetModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title={t("settings.privacyPolicy")}
        actionLabel={t("settings.iUnderstand")}
      >
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

      <SheetModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title={t("settings.helpSupport")}
        actionLabel={t("settings.close")}
      >
        <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary, paddingTop: 12, marginBottom: 8 }]}>
          {t("settings.helpIntro")}
        </Text>
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
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.foreground.primary, fontWeight: "600" }]}>
            {t("settings.developerName")}
          </Text>
          <Pressable onPress={() => Linking.openURL("mailto:marlexapong90@gmail.com")}>
            <Text style={[sheetSectionStyles.sectionContent, { color: colors.primary.default, textDecorationLine: "underline" }]}>
              {t("settings.supportEmail")}
            </Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL("https://mlya.me")}>
            <Text style={[sheetSectionStyles.sectionContent, { color: colors.primary.default, textDecorationLine: "underline" }]}>
              {t("settings.developerPortfolio")}
            </Text>
          </Pressable>
          <Text style={[sheetSectionStyles.sectionContent, { color: colors.muted.foreground, marginTop: 4 }]}>
            {t("settings.developerTagline")}
          </Text>
        </View>
      </SheetModal>

      {/* Disable app protection — PIN/biometric verification */}
      <Modal
        visible={disableAuthModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        statusBarTranslucent
        onRequestClose={() => setDisableAuthModalVisible(false)}
      >
        <View style={[styles.verifyModal, { backgroundColor: colors.background.primary }]}>
          <Pressable style={styles.verifyModalClose} onPress={() => setDisableAuthModalVisible(false)}>
            <Feather name="x" size={24} color={colors.foreground.primary} />
          </Pressable>
          <PinInput
            title={t("settings.verifyIdentity")}
            subtitle={t("settings.enterPinToDisable")}
            onComplete={handleDisableAuthPin}
            onBiometric={user?.biometric_enabled && localBiometricCapabilities?.isAvailable ? handleDisableAuthBiometric : undefined}
            biometricAvailable={!!(user?.biometric_enabled && localBiometricCapabilities?.isAvailable)}
            showBiometric={!!(user?.biometric_enabled && localBiometricCapabilities?.isAvailable)}
          />
        </View>
      </Modal>

      <EditProfileModal visible={editProfileModalVisible} onClose={() => setEditProfileModalVisible(false)} />
      <ChangePinModal visible={changePinModalVisible} onClose={() => setChangePinModalVisible(false)} />
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  scroll: { flex: 1 },
  content: { padding: 24 },
  settingCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  settingCardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  settingRowLeft: { flexDirection: "row", alignItems: "center" },
  settingRowIcon: { padding: 8, borderRadius: 999, marginRight: 12 },
  settingRowText: { flex: 1 },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  profileAvatar: { padding: 12, borderRadius: 999, marginRight: 16 },
  profileName: { fontSize: 18, fontWeight: "500" },
  profileEmail: { fontSize: 14 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  switchRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchRowLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  switchRowText: { flex: 1 },
  switchRowDesc: { fontSize: 14, marginTop: 2 },
  settingSection: { paddingVertical: 12 },
  settingSectionLabel: { fontWeight: "500", marginBottom: 12 },
  settingSectionDesc: { fontSize: 14, marginBottom: 12 },
  selectionButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  selectionBtnText: { fontSize: 14, fontWeight: "500" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 16,
    borderRadius: 8,
  },
  logoutBtnText: { fontWeight: "600", marginLeft: 8 },
  themeRow: { flexDirection: "row", gap: 8 },
  themeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  themeBtnText: { fontSize: 13, fontWeight: "600" },
  accentRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingTop: 4 },
  accentItem: { alignItems: "center", gap: 6, minWidth: 52 },
  accentDot: { width: 32, height: 32, borderRadius: 16 },
  accentLabel: { fontSize: 11, fontWeight: "500" },
  disabledHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  disabledHintText: { fontSize: 12, flex: 1 },
  verifyModal: { flex: 1, justifyContent: "center" },
  verifyModalClose: { position: "absolute", top: 56, right: 24, zIndex: 10 },
})
