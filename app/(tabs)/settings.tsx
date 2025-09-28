import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { useSettings } from "@/hooks/useSettings"
import { useTwColors } from "@/lib/tw-colors"
import { BiometricCapabilities, checkBiometricCapabilities, getBiometricDisplayName } from "@/services/biometricService"
import { useAuthStore } from "@/stores/authStore"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Modal, Pressable, ScrollView, Switch, Text, useColorScheme, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Settings() {
  const { user, logout, updateBiometricSetting, biometricCapabilities } = useAuthStore()
  const { settings, loading, updateSetting } = useSettings()
  const { twColor } = useTwColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()

  // State
  const [localBiometricCapabilities, setLocalBiometricCapabilities] = useState<BiometricCapabilities | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)

  useEffect(() => {
    const checkCapabilities = async () => {
      const capabilities = await checkBiometricCapabilities()
      setLocalBiometricCapabilities(capabilities)
    }
    checkCapabilities()
  }, [])

  const handleLogout = () => {
    Toast.confirm(
      "Are you sure you want to log out?",
      () => {
        logout()
        router.replace("/")
      },
      {
        title: "Confirm Logout",
        confirmText: "Log Out",
        cancelText: "Cancel",
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
    }
    else {
      Toast.success(enabled ?"Biometric enabled" : "Biometric disabled")
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
          Terms of Service
        </Text>
        <ScrollView>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            Last Updated: {new Date().toLocaleDateString()}
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            Welcome to YourCap! These Terms of Service govern your use of our debt management application.
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            By using our app, you agree to these terms. Please read them carefully.
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            1. <Text className="font-semibold">Free Service:</Text> Currently, YourCap is completely free to use. We may introduce premium features in the future with clear
            communication.
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            2. <Text className="font-semibold">Data Usage:</Text> To improve our services, we may collect anonymized usage data. Personal information will never be sold to third
            parties.
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            3. <Text className="font-semibold">User Responsibilities:</Text> You are responsible for maintaining the confidentiality of your account and ensuring the accuracy of
            your debt records.
          </Text>
        </ScrollView>
        <Pressable onPress={hideModal} style={{ backgroundColor: twColor("primary") }} className="p-4 rounded-xl mt-6">
          <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold">
            I Understand
          </Text>
        </Pressable>
      </View>,
    )
  }

  const showPrivacyModal = () => {
    showModal(
      <View className="p-6">
        <Text style={{ color: twColor("foreground") }} className="text-2xl font-bold mb-4">
          Privacy Policy
        </Text>
        <ScrollView>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            <Text className="font-semibold">Information We Collect:</Text>
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            • Account information (name, email, phone number)
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            • Debt records and financial information
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            • App usage data for improvement purposes
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            <Text className="font-semibold">How We Use Your Information:</Text>
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            • To provide and improve our services
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            • To send important notifications about your debts
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            • For analytical purposes to enhance user experience
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            Your data is stored securely and never shared with third parties without your consent, except as required by law.
          </Text>
        </ScrollView>
        <Pressable onPress={hideModal} style={{ backgroundColor: twColor("primary") }} className="p-4 rounded-xl mt-6">
          <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold">
            I Understand
          </Text>
        </Pressable>
      </View>,
    )
  }

  const showHelpModal = () => {
    showModal(
      <View className="p-6">
        <Text style={{ color: twColor("foreground") }} className="text-2xl font-bold mb-4">
          Help & Support
        </Text>
        <ScrollView>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            Need help with YourCap? Here are some resources:
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4 font-semibold">
            Frequently Asked Questions:
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-2">
            • How to add a new debt?
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            Go to the Dashboard tab and tap the "+" button to add a new debt record.
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-2">
            • How to change my PIN?
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            Navigate to Settings → Profile → Change PIN to update your security PIN.
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4 font-semibold">
            Contact Support:
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            Email: support@yourcap.app
          </Text>
          <Text style={{ color: twColor("foreground") }} className="text-base mb-4">
            We typically respond within 24 hours.
          </Text>
        </ScrollView>
        <Pressable onPress={hideModal} style={{ backgroundColor: twColor("primary") }} className="p-4 rounded-xl mt-6">
          <Text style={{ color: twColor("primary-foreground") }} className="text-center font-semibold">
            Close
          </Text>
        </Pressable>
      </View>,
    )
  }

  const handleExportData = () => {
    Toast.info("Export feature coming soon!", "Info")
  }

  const handleDeleteAccount = () => {
    Toast.confirm(
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      () => {
        Toast.info("Account deletion feature coming soon!", "Info")
      },
      {
        title: "Delete Account?",
        confirmText: "Delete",
        cancelText: "Cancel",
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
        <PageHeader title="Settings" textPosition="center" textAlign="left" />

        <View className="p-6">
          {/* User Profile Section */}
          <SettingCard title="Profile">
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

            <SettingRow icon="edit" title="Edit Profile" onPress={() => Toast.info("Edit profile feature coming soon!", "Info")} />
            <SettingRow icon="lock" title="Change PIN" onPress={() => Toast.info("Change PIN feature coming soon!", "Info")} />
          </SettingCard>

          {/* Security Section */}
          <SettingCard title="Security">
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
                Auto-logout after inactivity
              </Text>
              <SelectionButtons
                options={[
                  { value: 0, label: "Immediately" },
                  { value: 5, label: "5 min" },
                  { value: 15, label: "15 min" },
                  { value: 30, label: "30 min" },
                  { value: 60, label: "60 min" },
                  { value: 120, label: "120 min" },
                ]}
                selectedValue={settings.inactivity_timeout}
                onSelect={(minutes) => updateSetting("inactivity_timeout", minutes)}
              />
            </View>
          </SettingCard>

          {/* Session Management Section */}
          <SettingCard title="Session Management">
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text style={{ color: twColor("foreground") }}>Remember Me</Text>
                <Text style={{ color: twColor("muted-foreground") }} className="text-sm">
                  Keep me logged in on this device
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
                  Session Duration
                </Text>
                <SelectionButtons
                  options={[
                    { value: 1, label: "1 hour" },
                    { value: 8, label: "8 hours" },
                    { value: 24, label: "24 hours" },
                    { value: 168, label: "7 days" },
                  ]}
                  selectedValue={settings.session_duration / 60} // Convert minutes to hours
                  onSelect={handleSessionDurationChange}
                />
              </View>
            )}
          </SettingCard>

          {/* Notifications Section */}
          <SettingCard title="Notifications">
            <View className="flex-row items-center justify-between py-3">
              <Text style={{ color: twColor("foreground") }}>Enable Notifications</Text>
              <Switch
                value={settings.notification_enabled}
                onValueChange={(val) => {
                  updateSetting("notification_enabled", val)
                }}
                trackColor={{
                  false: twColor("muted"),
                  true: twColor("primary"),
                }}
                thumbColor={twColor("card-background")}
              />
            </View>

            {settings.notification_enabled && (
              <View
                style={{
                  borderTopColor: twColor("border"),
                }}
                className="py-3 border-t"
              >
                <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
                  Days Before Reminder
                </Text>
                <SelectionButtons
                  options={[
                    { value: 1, label: "1 day" },
                    { value: 3, label: "3 days" },
                    { value: 5, label: "5 days" },
                    { value: 7, label: "7 days" },
                  ]}
                  selectedValue={settings.days_before_reminder}
                  onSelect={(days) => updateSetting("days_before_reminder", days)}
                />
              </View>
            )}
          </SettingCard>

          {/* About Section */}
          <SettingCard title="About">
            <SettingRow icon="file-text" title="Terms of Service" onPress={showTermsModal} />
            <SettingRow icon="shield" title="Privacy Policy" onPress={showPrivacyModal} />
            <SettingRow icon="help-circle" title="Help & Support" onPress={showHelpModal} />
          </SettingCard>

          {/* Danger Zone */}
          <SettingCard title="Danger Zone" isDanger>
            <SettingRow icon="download" title="Export Data" onPress={handleExportData} isDanger />
            <SettingRow icon="trash-2" title="Delete Account" onPress={handleDeleteAccount} isDanger />

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
                Log Out
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
    </>
  )
}
