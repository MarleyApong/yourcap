import { ChangePinModal } from "@/components/feature/change-pin-modal"
import { EditProfileModal } from "@/components/feature/edit-profile-modal"
import { ImportExportSection } from "@/components/feature/import-export-section"
import { LanguageSelector } from "@/components/feature/language-selector"
import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { useSettings } from "@/hooks/useSettings"
import { useTranslation } from "@/i18n"
import { SupportedLanguage } from "@/i18n/locales"
import { useTwColors } from "@/lib/tw-colors"
import { BiometricCapabilities, checkBiometricCapabilities, getBiometricDisplayName } from "@/services/biometricService"
import { requestNotificationPermissions, scheduleAllDebtReminders, updateNotificationSettings } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Modal, Pressable, ScrollView, Switch, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Settings() {
  const { user, logout, updateBiometricSetting } = useAuthStore()
  const { settings, loading, updateSetting } = useSettings()
  const { twColor } = useTwColors()
  const { t, currentLanguage } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // State
  const [localBiometricCapabilities, setLocalBiometricCapabilities] = useState<BiometricCapabilities | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false)
  const [changePinModalVisible, setChangePinModalVisible] = useState(false)

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

    const success = await updateBiometricSetting(enabled)
    if (!success) {
      Toast.error("Failed to update biometric setting", "Error")
    } else {
      Toast.success(enabled ? "Biometric enabled" : "Biometric disabled")
    }
  }

  const handleRememberSessionToggle = async (enabled: boolean) => {
    await updateSetting("remember_session", enabled)

    // Si on désactive "remember session", on efface immédiatement l'expiration
    if (!enabled) {
      const { clearSessionExpiry } = await import("@/lib/auth")
      await clearSessionExpiry()
    }
  }

  const handleSessionDurationChange = async (hours: number) => {
    const minutes = hours * 60
    const success = await updateSetting("session_duration", minutes)

    if (success) {
      // Mettre à jour immédiatement l'expiration si la session est active
      if (settings.remember_session) {
        const { setSessionExpiry } = await import("@/lib/auth")
        await setSessionExpiry()
      }
      Toast.success("Session duration updated", "Success")
    }
  }

  const handleLanguageChange = async (language: SupportedLanguage) => {
    const success = await updateSetting("language", language)
    if (success) {
      Toast.success(t("settings.selectLanguage"))
    } else {
      Toast.error(t("common.error"))
    }
  }

  const showModal = (content: React.ReactNode) => {
    setModalContent(content)
    setModalVisible(true)
  }

  const hideModal = () => {
    setModalVisible(false)
    setModalContent(null)
  }

  const showTermsModal = () => {
    showModal(
      <View className="p-6">
        <Text style={{ color: twColor("foreground") }} className="text-2xl font-bold mb-4">
          {t("settings.termsOfService")}
        </Text>
        <ScrollView>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.lastUpdated")} {new Date().toLocaleDateString()}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.termsWelcome")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.termsAgreement")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            1. <Text className="font-semibold">{t("settings.freeService")}</Text> {t("settings.freeServiceText")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            2. <Text className="font-semibold">{t("settings.dataUsage")}</Text> {t("settings.dataUsageText")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            3. <Text className="font-semibold">{t("settings.userResponsibilities")}</Text> {t("settings.userResponsibilitiesText")}
          </Text>
        </ScrollView>
        <Pressable onPress={hideModal} style={{ backgroundColor: twColor("primary") }} className="p-4 rounded-xl mt-6">
          <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold">
            {t("settings.iUnderstand")}
          </Text>
        </Pressable>
      </View>,
    )
  }

  const showPrivacyModal = () => {
    showModal(
      <View className="p-6">
        <Text style={{ color: twColor("foreground") }} className="text-2xl font-bold mb-4">
          {t("settings.privacyPolicy")}
        </Text>
        <ScrollView>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.privacyImportant")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            <Text className="font-semibold">{t("settings.informationWeCollect")}</Text>
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.accountInfo")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.debtRecords")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.usageData")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            <Text className="font-semibold">{t("settings.howWeUse")}</Text>
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.provideServices")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.sendNotifications")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.analytics")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.dataSecure")}
          </Text>
        </ScrollView>
        <Pressable onPress={hideModal} style={{ backgroundColor: twColor("primary") }} className="p-4 rounded-xl mt-6">
          <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold">
            {t("settings.iUnderstand")}
          </Text>
        </Pressable>
      </View>,
    )
  }

  const showHelpModal = () => {
    showModal(
      <View className="p-6">
        <Text style={{ color: twColor("foreground") }} className="text-2xl font-bold mb-4">
          {t("settings.helpSupport")}
        </Text>
        <ScrollView>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.helpIntro")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4 font-semibold">
            {t("settings.faq")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-2">
            {t("settings.howToAddDebt")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.howToAddDebtAnswer")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-2">
            {t("settings.howToChangePin")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.howToChangePinAnswer")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4 font-semibold">
            {t("settings.contactSupport")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.supportEmail")}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            {t("settings.responseTime")}
          </Text>
        </ScrollView>
        <Pressable onPress={hideModal} style={{ backgroundColor: twColor("primary") }} className="p-4 rounded-xl mt-6">
          <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold">
            {t("settings.close")}
          </Text>
        </Pressable>
      </View>,
    )
  }



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
      style={{
        backgroundColor: twColor("card-background"),
        borderColor: isDanger ? twColor("destructive") : twColor("border"),
      }}
      className={`p-6 rounded-xl shadow-sm mb-6 border ${isDanger ? "border-opacity-20" : ""}`}
    >
      <Text
        style={{
          color: isDanger ? twColor("destructive") : twColor("foreground"),
        }}
        className="text-lg font-semibold mb-4"
      >
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
      style={{
        borderTopColor: isDanger ? `${twColor("destructive")}20` : twColor("border"),
      }}
      className="flex-row items-center justify-between py-3 border-t"
    >
      <View className="flex-row items-center">
        {icon && (
          <View
            style={{
              backgroundColor: isDanger ? `${twColor("destructive")}15` : `${twColor("primary")}`,
            }}
            className="p-2 rounded-full mr-3"
          >
            <Feather name={icon as any} size={20} color={isDanger ? twColor("destructive") : twColor("primary-foreground")} />
          </View>
        )}
        <Text
          style={{
            color: isDanger ? twColor("destructive") : twColor("foreground"),
          }}
          className="flex-1"
        >
          {title}
        </Text>
      </View>
      {showChevron && <Feather name="chevron-right" size={20} color={isDanger ? twColor("destructive") : twColor("muted-foreground")} />}
    </Pressable>
  )

  const SelectionButtons = ({ options, selectedValue, onSelect }: { options: { value: any; label: string }[]; selectedValue: any; onSelect: (value: any) => void }) => (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onSelect(option.value)}
          style={{
            backgroundColor: selectedValue === option.value ? twColor("primary") : twColor("secondary"),
          }}
          className="px-4 py-2 rounded-full"
        >
          <Text
            style={{
              color: selectedValue === option.value ? twColor("primary-foreground") : twColor("secondary-foreground"),
            }}
            className="text-sm font-medium"
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
    onSelectionChange 
  }: { 
    options: { value: string; label: string }[]; 
    selectedValues: string[]; 
    onSelectionChange: (values: string[]) => void 
  }) => {
    const toggleSelection = (value: string) => {
      let newSelection: string[]
      if (selectedValues.includes(value)) {
        // Remove if already selected (but keep at least one)
        if (selectedValues.length > 1) {
          newSelection = selectedValues.filter(v => v !== value)
        } else {
          return // Don't allow removing the last selected time
        }
      } else {
        // Add if not selected
        newSelection = [...selectedValues, value]
      }
      onSelectionChange(newSelection)
    }

    return (
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value)
          return (
            <Pressable
              key={option.value}
              onPress={() => toggleSelection(option.value)}
              style={{
                backgroundColor: isSelected ? twColor("primary") : twColor("secondary"),
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? twColor("primary") : twColor("border"),
              }}
              className="px-4 py-2 rounded-full"
            >
              <Text
                style={{
                  color: isSelected ? twColor("primary-foreground") : twColor("secondary-foreground"),
                }}
                className="text-sm font-medium"
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
      <View
        className="flex-1 px-6 pt-6"
        style={{
          backgroundColor: twColor("background"),
        }}
      >
        <LoadingState message="Loading settings..." />
      </View>
    )
  }

  return (
    <>
      <ScrollView
        style={{
          backgroundColor: twColor("background"),
        }}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(40, insets.bottom + 20),
        }}
      >
        <PageHeader title={t("settings.title")} textPosition="center" textAlign="left" />

        <View className="p-6">
          {/* User Profile Section */}
          <SettingCard title={t("settings.profile")}>
            <View className="flex-row items-center mb-4">
              <View
                style={{
                  backgroundColor: `${twColor("primary")}`,
                }}
                className="p-3 rounded-full mr-4"
              >
                <Feather name="user" size={24} color={twColor("primary-foreground")} />
              </View>
              <View>
                <Text style={{ color: twColor("foreground") }} className="text-lg font-medium">
                  {user?.full_name}
                </Text>
                <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                  {user?.email}
                </Text>
              </View>
            </View>

            <SettingRow icon="edit" title={t("settings.editProfile")} onPress={() => setEditProfileModalVisible(true)} />
            <SettingRow icon="lock" title={t("settings.changePin")} onPress={() => setChangePinModalVisible(true)} />
          </SettingCard>

          {/* Security Section */}
          <SettingCard title={t("settings.security")}>
            {localBiometricCapabilities?.isAvailable && (
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center flex-1">
                  <View
                    style={{
                      backgroundColor: `${twColor("primary")}`,
                    }}
                    className="p-2 rounded-full mr-3"
                  >
                    <MaterialIcons name="fingerprint" size={20} color={twColor("primary-foreground")} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: twColor("foreground") }}>{getBiometricDisplayName(localBiometricCapabilities.biometryType)} Authentication</Text>
                    <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                      Use {getBiometricDisplayName(localBiometricCapabilities.biometryType).toLowerCase()} to unlock
                    </Text>
                  </View>
                </View>
                <Switch
                  value={user?.biometric_enabled || false}
                  onValueChange={handleBiometricToggle}
                  trackColor={{
                    false: twColor("muted"),
                    true: twColor("primary"),
                  }}
                  thumbColor={twColor("card-background")}
                />
              </View>
            )}

            <View
              className={`py-3 ${localBiometricCapabilities?.isAvailable ? "border-t" : ""}`}
              style={{
                borderTopColor: twColor("border"),
              }}
            >
              <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                {t("settings.autoLogout")}
              </Text>
              <SelectionButtons
                options={[
                  // { value: 0, label: "Immediately" },
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
          </SettingCard>

          {/* Session Management Section */}
          <SettingCard title={t("settings.sessionManagement")}>
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text style={{ color: twColor("foreground") }}>{t("settings.rememberMe")}</Text>
                <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                  {t("settings.rememberMeDescription")}
                </Text>
              </View>
              <Switch
                value={settings.remember_session}
                onValueChange={handleRememberSessionToggle}
                trackColor={{
                  false: twColor("muted"),
                  true: twColor("primary"),
                }}
                thumbColor={twColor("card-background")}
              />
            </View>

            {settings.remember_session && (
              <View
                style={{
                  borderTopColor: twColor("border"),
                }}
                className="py-3 border-t"
              >
                <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                  {t("settings.sessionDuration")}
                </Text>
                <SelectionButtons
                  options={[
                    { value: 1, label: t("settings.oneHour") },
                    { value: 8, label: t("settings.eightHours") },
                    { value: 24, label: t("settings.twentyFourHours") },
                    { value: 168, label: t("settings.sevenDays") },
                  ]}
                  selectedValue={settings.session_duration / 60} // Convert minutes to hours
                  onSelect={handleSessionDurationChange}
                />
              </View>
            )}
          </SettingCard>

          {/* Notifications Section */}
          <SettingCard title={t("settings.notifications")}>
            <View className="flex-row items-center justify-between py-3">
              <Text style={{ color: twColor("foreground") }}>{t("settings.enableNotifications")}</Text>
              <Switch
                value={settings.notification_enabled}
                onValueChange={async (val) => {
                  const success = await updateSetting("notification_enabled", val)
                  if (success && val) {
                    // Request permissions and schedule notifications
                    const hasPermission = await requestNotificationPermissions()
                    if (hasPermission && user?.user_id) {
                      await scheduleAllDebtReminders(user.user_id)
                      Toast.success(t("settings.notificationsEnabled"))
                    } else {
                      Toast.error(t("settings.notificationPermissionsDenied"))
                    }
                  } else if (success && !val) {
                    // Cancel all notifications
                    const Notifications = await import("expo-notifications")
                    await Notifications.cancelAllScheduledNotificationsAsync()
                    Toast.success(t("settings.notificationsDisabled"))
                  }
                }}
                trackColor={{
                  false: twColor("muted"),
                  true: twColor("primary"),
                }}
                thumbColor={twColor("card-background")}
              />
            </View>

            {settings.notification_enabled && (
              <>
                {/* Notification Types */}
                <View
                  style={{
                    borderTopColor: twColor("border"),
                  }}
                  className="py-3 border-t"
                >
                  <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                    {t("settings.notificationTypes")}
                  </Text>

                  {/* System Notifications */}
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-1">
                      <Text style={{ color: twColor("foreground") }}>{t("settings.systemNotifications")}</Text>
                      <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                        {t("settings.systemNotificationsDesc")}
                      </Text>
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
                      trackColor={{
                        false: twColor("muted"),
                        true: twColor("primary"),
                      }}
                      thumbColor={twColor("card-background")}
                    />
                  </View>

                  {/* Email Notifications */}
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-1">
                      <Text style={{ color: twColor("foreground") }}>{t("settings.emailNotifications")}</Text>
                      <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                        {t("settings.emailNotificationsDesc")}
                      </Text>
                    </View>
                    <Switch
                      value={settings.email_notifications}
                      onValueChange={() => Toast.info(t("settings.emailComingSoon"))}
                      trackColor={{
                        false: twColor("muted"),
                        true: twColor("primary"),
                      }}
                      thumbColor={twColor("card-background")}
                    />
                  </View>

                  {/* SMS Notifications */}
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-1">
                      <Text style={{ color: twColor("foreground") }}>{t("settings.smsNotifications")}</Text>
                      <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                        {t("settings.smsNotificationsDesc")}
                      </Text>
                    </View>
                    <Switch
                      value={settings.sms_notifications}
                      onValueChange={() => Toast.info(t("settings.smsComingSoon"))}
                      trackColor={{
                        false: twColor("muted"),
                        true: twColor("primary"),
                      }}
                      thumbColor={twColor("card-background")}
                    />
                  </View>
                </View>

                {/* Days Before Reminder */}
                <View
                  style={{
                    borderTopColor: twColor("border"),
                  }}
                  className="py-3 border-t"
                >
                  <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                    {t("settings.daysBeforeReminder")}
                  </Text>
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

                {/* Notification Times - Multiple Selection */}
                <View
                  style={{
                    borderTopColor: twColor("border"),
                  }}
                  className="py-3 border-t"
                >
                  <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                    {t("settings.preferredNotificationTimes")}
                  </Text>
                  <Text style={{ color: twColor("muted-foreground") }} className="text-sm mb-3">
                    {t("settings.selectMultipleTimes")}
                  </Text>
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

                {/* Summary Notifications */}
                <View
                  style={{
                    borderTopColor: twColor("border"),
                  }}
                  className="py-3 border-t"
                >
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-1">
                      <Text style={{ color: twColor("foreground") }}>{t("settings.summaryNotifications")}</Text>
                      <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                        {t("settings.summaryNotificationsDesc")}
                      </Text>
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
                      trackColor={{
                        false: twColor("muted"),
                        true: twColor("primary"),
                      }}
                      thumbColor={twColor("card-background")}
                    />
                  </View>

                  {settings.summary_notifications && (
                    <>
                      {/* Summary Frequency */}
                      <View className="py-3">
                        <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                          {t("settings.summaryFrequency")}
                        </Text>
                        <SelectionButtons
                          options={[
                            { value: 'daily', label: t("settings.daily") },
                            { value: 'weekly', label: t("settings.weekly") },
                            { value: 'none', label: t("common.none") },
                          ]}
                          selectedValue={settings.summary_frequency || 'daily'}
                          onSelect={async (frequency) => {
                            const success = await updateSetting("summary_frequency", frequency)
                            if (success && user?.user_id) {
                              await scheduleAllDebtReminders(user.user_id)
                              Toast.success(t("settings.summaryFrequencyUpdated"))
                            }
                          }}
                        />
                      </View>

                      {/* Summary Time */}
                      {settings.summary_frequency !== 'none' && (
                        <View className="py-3">
                          <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                            {t("settings.summaryTime")}
                          </Text>
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

          {/* Language Section */}
          <SettingCard title={t("settings.language")}>
            <View className="py-3">
              <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                {t("settings.selectLanguage")}
              </Text>
              <LanguageSelector 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </View>
          </SettingCard>

          {/* Data Management Section */}
          <SettingCard title={t("settings.data")}>
            <ImportExportSection 
              userId={user?.user_id || ''} 
              onImportComplete={(imported, total) => {
                Toast.success(`${imported}/${total} ${t("settings.debtsImported")}`)
              }}
            />
          </SettingCard>

          {/* About Section */}
          <SettingCard title={t("settings.about")}>
            <SettingRow icon="file-text" title={t("settings.termsOfServiceTitle")} onPress={showTermsModal} />
            <SettingRow icon="shield" title={t("settings.privacyPolicyTitle")} onPress={showPrivacyModal} />
            <SettingRow icon="help-circle" title={t("settings.helpSupportTitle")} onPress={showHelpModal} />
          </SettingCard>

          {/* Testing Section - Only show in development */}
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
              style={{
                backgroundColor: twColor("destructive"),
                borderTopColor: `${twColor("destructive")}20`,
              }}
              className="flex-row items-center justify-center py-3 border-t mt-4 rounded-lg"
            >
              <Feather name="log-out" size={20} color={twColor("destructive-foreground")} />
              <Text style={{ color: twColor("destructive-foreground") }} className="font-semibold ml-2">
                {t("settings.logOut")}
              </Text>
            </Pressable>
          </SettingCard>
        </View>
      </ScrollView>

      {/* Modal pour afficher le contenu */}
      <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={hideModal}>
        <View style={{ backgroundColor: twColor("background") }} className="flex-1 pt-14">
          <View className="px-6 pb-4 border-b" style={{ borderBottomColor: twColor("border") }}>
            <Pressable onPress={hideModal} className="self-start">
              <Feather name="x" size={24} color={twColor("foreground")} />
            </Pressable>
          </View>
          {modalContent}
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        visible={editProfileModalVisible} 
        onClose={() => setEditProfileModalVisible(false)} 
      />

      {/* Change PIN Modal */}
      <ChangePinModal 
        visible={changePinModalVisible} 
        onClose={() => setChangePinModalVisible(false)} 
      />
    </>
  )
}
