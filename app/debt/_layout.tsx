import { useTwColors } from "@/lib/tw-colors"
import { Stack, useRouter } from "expo-router"
import { StatusBar, Pressable } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"

export default function DebtLayout() {
  const { twColor } = useTwColors()
  const router = useRouter()

  // Simple back button
  const BackButton = () => (
    <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
      <Feather name="arrow-left" size={24} color={twColor("primary")} />
    </Pressable>
  )

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={twColor("white")} />

      <SafeAreaView style={{ flex: 1, backgroundColor: twColor("white") }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="add" options={{ title: "Add Debt" }} />
          <Stack.Screen name="[id]" options={{ title: "Debt Details" }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
