import { LoadingState } from "@/components/feature/loading-state"
import { PageHeader } from "@/components/feature/page-header"
import { useSettings } from "@/hooks/useSettings"
import { useTwColors } from "@/lib/tw-colors"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Pressable, ScrollView, Switch, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Settings() {
  const { user, logout } = useAuthStore()
  const { settings, loading, updateSetting } = useSettings()
  const router = useRouter()
  const { twColor } = useTwColors()
  const insets = useSafeAreaInsets()

  const handleLogout = () => {
    Alert.confirm(
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
              backgroundColor: isDanger ? `${twColor("destructive")}15` : `${twColor("primary")}15`,
            }}
            className="p-2 rounded-full mr-3"
          >
            <Feather name={icon as any} size={20} color={isDanger ? twColor("destructive") : twColor("primary")} />
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
    <ScrollView
      style={{
        backgroundColor: twColor("background"),
      }}
      className="flex-1"
      contentContainerStyle={{
        paddingBottom: Math.max(40, insets.bottom + 20),
      }}
    >
      {/* Fixed header */}
      <PageHeader title="Settings" textPosition="center" textAlign="left" />

      <View className="p-6">
        {/* User Profile Section */}
        <SettingCard title="Profile">
          <View className="flex-row items-center mb-4">
            <View
              style={{
                backgroundColor: `${twColor("primary")}15`,
              }}
              className="p-3 rounded-full mr-4"
            >
              <Feather name="user" size={24} color={twColor("primary")} />
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

          <SettingRow title="Edit Profile" onPress={() => router.push("/profile/edit")} />
          <SettingRow title="Change Password" onPress={() => router.push("/change-password")} />
        </SettingCard>

        {/* Notifications Section */}
        <SettingCard title="Notifications">
          <View className="flex-row items-center justify-between py-3">
            <Text style={{ color: twColor("foreground") }}>Enable Notifications</Text>
            <Switch
              value={settings.notification_enabled}
              onValueChange={(val) => updateSetting("notification_enabled", val)}
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

        {/* Preferences Section */}
        {/* <SettingCard title="Preferences">
          <View className="py-3">
            <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
              Currency
            </Text>
            <SelectionButtons
              options={[
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "XAF", label: "XAF" },
                { value: "GBP", label: "GBP" },
              ]}
              selectedValue={settings.currency}
              onSelect={(curr) => updateSetting("currency", curr)}
            />
          </View>
        </SettingCard> */}

        {/* Security Section */}
        <SettingCard title="Security">
          <View className="py-3">
            <Text style={{ color: twColor("foreground") }} className="mb-3 font-medium">
              Auto-logout after inactivity
            </Text>
            <SelectionButtons
              options={[
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

        {/* About Section */}
        <SettingCard title="About">
          <SettingRow title="Terms of Service" onPress={() => router.push("/terms")} />
          <SettingRow title="Privacy Policy" onPress={() => router.push("/privacy")} />
          <SettingRow title="Help & Support" onPress={() => router.push("/help")} />
        </SettingCard>

        {/* Danger Zone */}
        <SettingCard title="Danger Zone" isDanger>
          <SettingRow title="Export Data" onPress={() => {}} isDanger />
          <SettingRow title="Delete Account" onPress={() => {}} isDanger />

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
  )
}
