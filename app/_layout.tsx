import { ActivityIndicator, StatusBar, View } from "react-native"
import { Stack } from "expo-router"
import { useEffect, useState } from "react"
import { initDb } from "@/db/db"
import { AppProvider } from "@/contexts/AppContext"
import useInactivityTimeout from "@/hooks/useInactivityTimeout"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import "../global.css"

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
      <AppProvider>
        <StatusBar hidden />
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
    </SafeAreaProvider>
  )
}
