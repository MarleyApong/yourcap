import { ActivityIndicator, View } from "react-native"
import { Stack } from "expo-router"
import { useEffect, useState } from "react"
import { initDb } from "@/db/db"
import { AppProvider } from "@/contexts/AppContext"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AlertProvider } from "@/components/ui/alert"
import useInactivityTimeout from "@/hooks/useInactivityTimeout"
import "../global.css"
import "react-native-get-random-values"

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initDb().finally(() => setIsReady(true))
  }, [])

  useInactivityTimeout()

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="debt" />
          </Stack>
        </AppProvider>
      </AlertProvider>
    </SafeAreaProvider>
  )
}
