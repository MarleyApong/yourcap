import useInactivityTimeout from "@/hooks/useInactivityTimeout"
import { Stack } from "expo-router"
import { useEffect } from "react"
import { initDb } from "@/db/db"
import "react-native-get-random-values"
import "../global.css"

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDb()
      } catch (error) {
        console.error("Database initialization failed:", error)
      }
    }
    initializeApp()
  }, [])

  useInactivityTimeout()

  return (
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
  )
}
