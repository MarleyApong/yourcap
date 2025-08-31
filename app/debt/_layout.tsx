import { useTwColors } from "@/lib/tw-colors"
import { Stack } from "expo-router"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

export default function DebtLayout() {
  const { twColor } = useTwColors()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: twColor("background") }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="add" options={{ title: "Add Debt", headerShown: false }} />
        <Stack.Screen name="[id]" options={{ title: "Debt Details" }} />
      </Stack>
    </SafeAreaView>
  )
}
