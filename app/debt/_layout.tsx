import { useTheme } from "@/core/theme"
import { Stack } from "expo-router"
import { View } from "react-native"

export default function DebtLayout() {
  const { colors } = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary.default }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: colors.primary.default },
        }}
      >
        <Stack.Screen name="add" />
        <Stack.Screen name="[id]" />
      </Stack>
    </View>
  )
}
