import { useTheme } from "@/core/theme"
import { Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SettingsLayout() {
  const { colors } = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={["top"]}>
      <Stack screenOptions={{ headerShown: false, animation: "none", contentStyle: { backgroundColor: colors.background.primary } }} />
    </SafeAreaView>
  )
}
