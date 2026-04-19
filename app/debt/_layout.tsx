import { useTheme } from "@/core/theme"
import { Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

export default function DebtLayout() {
  const { colors } = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_bottom",
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="add" options={{ title: "Add Debt", headerShown: false }} />
        <Stack.Screen name="[id]" options={{ title: "Debt Details" }} />
      </Stack>
    </SafeAreaView>
  )
}
