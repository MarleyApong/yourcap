import { View, Text, Pressable } from "react-native"
import { useAuth } from "@/hooks/useAuth"

export default function Settings() {
  const { logout } = useAuth()

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-6">Settings</Text>

      <Pressable onPress={logout} className="bg-red-500 p-4 rounded-lg">
        <Text className="text-white text-center font-semibold">Logout</Text>
      </Pressable>
    </View>
  )
}
