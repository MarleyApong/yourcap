import { useTheme } from "@/core/theme"
import { Stack } from "expo-router"
import { View } from "react-native"

export default function SettingsLayout() {
  const { colors } = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Stack screenOptions={{ headerShown: false, animation: "none", contentStyle: { backgroundColor: colors.background.primary } }} />
    </View>
  )
}
