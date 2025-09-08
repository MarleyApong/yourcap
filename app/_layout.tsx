import { ActivityIndicator, View } from "react-native"
import { Stack } from "expo-router"
import { useEffect, useState } from "react"
import { initDb, isDatabaseReady } from "@/db/db"
import { AppProvider } from "@/contexts/AppContext"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AlertProvider } from "@/components/ui/alert"
import useInactivityTimeout, { useAppStartup } from "@/hooks/useInactivityTimeout"
import "../global.css"
import "react-native-get-random-values"

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  // Initialize database
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("🚀 Starting database initialization...")
        await initDb()

        // Vérifier que la DB est bien prête
        if (isDatabaseReady()) {
          console.log("✅ Database is ready")
          setIsReady(true)
        } else {
          throw new Error("Database initialization failed - not ready")
        }
      } catch (error) {
        console.error("❌ Database initialization error:", error)
        setIsReady(true) // Set to true to show error state instead of loading
      }
    }

    initializeDatabase()
  }, [])

  // Use the new app startup hook
  useAppStartup()

  // Use the inactivity timeout hook
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
