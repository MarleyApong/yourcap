import { ActivityIndicator, View } from "react-native"
import useInactivityTimeout from "@/hooks/useInactivityTimeout"
import { Stack } from "expo-router"
import { useEffect, useState } from "react"
import { initDb } from "@/db/db"
import "react-native-get-random-values"
import "../global.css"
import { AppProvider } from "@/contexts/AppContext"

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDb()
        setIsReady(true)
      } catch (error) {
        console.error("Database initialization failed:", error)
        setIsReady(true) // Mettez quand même isReady à true pour afficher l'UI
      }
    }
    initializeApp()
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
    <AppProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="debt/add"
          options={{
            title: "New debt",
            headerBackTitle: "Back",
            headerShadowVisible: false,
            headerTitleAlign: "center",
            headerShown: false,
          }}
        />
      </Stack>
    </AppProvider>
  )
}
