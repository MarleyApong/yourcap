// app/(tabs)/settings.tsx - Settings page using native header
import { View, Text, ScrollView, Switch, Pressable } from "react-native"
import { useAuth } from "@/hooks/useAuth"
import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTwColors } from "@/lib/tw-colors"
import { useSettings } from "@/hooks/useSettings"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function Settings() {
  const { user, logout } = useAuth()
  const { settings, loading, updateSetting } = useSettings()
  const router = useRouter()
  const { twColor } = useTwColors()
  const insets = useSafeAreaInsets()

  const handleLogout = () => {
    logout()
    router.replace("/")
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text>Loading settings...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{
        paddingBottom: Math.max(40, insets.bottom + 20),
      }}
    >
      <View className="p-6">
        {/* User Profile Section */}
        <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Profile</Text>

          <View className="flex-row items-center mb-4">
            <View className="bg-primary/10 p-3 rounded-full mr-4">
              <Feather name="user" size={24} color={twColor("primary")} />
            </View>
            <View>
              <Text className="text-lg font-medium text-gray-900">{user?.full_name}</Text>
              <Text className="text-gray-500">{user?.email}</Text>
            </View>
          </View>

          <Pressable onPress={() => router.push("/profile/edit")} className="flex-row items-center justify-between py-3 border-t border-gray-100">
            <Text className="text-gray-700">Edit Profile</Text>
            <Feather name="chevron-right" size={20} color={twColor("gray-400")} />
          </Pressable>

          <Pressable onPress={() => router.push("/change-password")} className="flex-row items-center justify-between py-3 border-t border-gray-100">
            <Text className="text-gray-700">Change Password</Text>
            <Feather name="chevron-right" size={20} color={twColor("gray-400")} />
          </Pressable>
        </View>

        {/* Notifications Section */}
        <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Notifications</Text>

          <View className="flex-row items-center justify-between py-3">
            <Text className="text-gray-700">Enable Notifications</Text>
            <Switch
              value={settings.notification_enabled}
              onValueChange={(val) => updateSetting("notification_enabled", val)}
              trackColor={{ false: twColor("gray-300"), true: twColor("primary") }}
              thumbColor="white"
            />
          </View>

          {settings.notification_enabled && (
            <View className="py-3 border-t border-gray-100">
              <Text className="text-gray-700 mb-2">Days Before Reminder</Text>
              <View className="flex-row justify-between">
                {[1, 3, 5, 7].map((days) => (
                  <Pressable
                    key={days}
                    onPress={() => updateSetting("days_before_reminder", days)}
                    className={`px-4 py-2 rounded-full ${settings.days_before_reminder === days ? "bg-primary" : "bg-gray-100"}`}
                  >
                    <Text className={settings.days_before_reminder === days ? "text-white" : "text-gray-700"}>
                      {days} day{days > 1 ? "s" : ""}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Preferences</Text>

          <View className="py-3">
            <Text className="text-gray-700 mb-2">Currency</Text>
            <View className="flex-row flex-wrap gap-2">
              {["USD", "EUR", "XAF", "GBP"].map((curr) => (
                <Pressable
                  key={curr}
                  onPress={() => updateSetting("currency", curr)}
                  className={`px-4 py-2 rounded-full ${settings.currency === curr ? "bg-primary" : "bg-gray-100"}`}
                >
                  <Text className={settings.currency === curr ? "text-white" : "text-gray-700"}>{curr}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Security</Text>

          <View className="py-3">
            <Text className="text-gray-700 mb-2">Auto-logout after inactivity</Text>
            <View className="flex-row justify-between">
              {[15, 30, 60, 120].map((minutes) => (
                <Pressable
                  key={minutes}
                  onPress={() => updateSetting("inactivity_timeout", minutes)}
                  className={`px-4 py-2 rounded-full ${settings.inactivity_timeout === minutes ? "bg-primary" : "bg-gray-100"}`}
                >
                  <Text className={settings.inactivity_timeout === minutes ? "text-white" : "text-gray-700"}>{minutes} min</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* About Section */}
        <View className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">About</Text>

          <Pressable onPress={() => router.push("/terms")} className="flex-row items-center justify-between py-3 border-t border-gray-100">
            <Text className="text-gray-700">Terms of Service</Text>
            <Feather name="chevron-right" size={20} color={twColor("gray-400")} />
          </Pressable>

          <Pressable onPress={() => router.push("/privacy")} className="flex-row items-center justify-between py-3 border-t border-gray-100">
            <Text className="text-gray-700">Privacy Policy</Text>
            <Feather name="chevron-right" size={20} color={twColor("gray-400")} />
          </Pressable>

          <Pressable onPress={() => router.push("/help")} className="flex-row items-center justify-between py-3 border-t border-gray-100">
            <Text className="text-gray-700">Help & Support</Text>
            <Feather name="chevron-right" size={20} color={twColor("gray-400")} />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
          <Text className="text-lg font-semibold text-red-500 mb-4">Danger Zone</Text>

          <Pressable onPress={() => {}} className="flex-row items-center justify-between py-3 border-t border-red-100">
            <Text className="text-red-500">Export Data</Text>
            <Feather name="chevron-right" size={20} color={twColor("red-400")} />
          </Pressable>

          <Pressable onPress={() => {}} className="flex-row items-center justify-between py-3 border-t border-red-100">
            <Text className="text-red-500">Delete Account</Text>
            <Feather name="chevron-right" size={20} color={twColor("red-400")} />
          </Pressable>

          <Pressable onPress={handleLogout} className="flex-row items-center justify-center py-3 border-t border-red-100 mt-4">
            <Text className="text-red-500 font-semibold">Log Out</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
