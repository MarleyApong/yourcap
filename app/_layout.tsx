import { ToastProvider } from "@/components/ui/toast"
import { AppProvider } from "@/contexts/AppContext"
import { initDb, isDatabaseReady } from "@/db/db"
import useInactivityTimeout, { useAppStartup } from "@/hooks/useInactivityTimeout"
import { useAuthStore } from "@/stores/authStore"
import { Stack, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import "react-native-get-random-values"
import "@/lib/toast-global"
import "../global.css"
import { expoDb } from "@/db/client"
import { useDrizzleStudio } from "expo-drizzle-studio-plugin"

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const { user, isInitialized, loading: authLoading, sessionExpired } = useAuthStore()
  const router = useRouter()

  // Initialize database
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("🚀 Starting database initialization...")
        await initDb()

        if (isDatabaseReady()) {
          console.log("✅ Database is ready")
          setIsDbReady(true)
        } else {
          throw new Error("Database initialization failed - not ready")
        }
      } catch (error) {
        console.error("❌ Database initialization error:", error)
        setDbError(error instanceof Error ? error.message : "Database initialization failed")
        setIsDbReady(true)
      }
    }

    initializeDatabase()
  }, [])

  // Use the app startup hook (authentication)
  useAppStartup()

  // Use the inactivity timeout hook
  useInactivityTimeout()

  useDrizzleStudio(expoDb)

  // Handle redirection once everything is ready
  useEffect(() => {
    if (!isDbReady || !isInitialized || authLoading) return

    if (user && !sessionExpired) {
      router.replace("/(tabs)/dashboard")
    } else {
      router.replace("/auth/login")
    }
  }, [isDbReady, isInitialized, authLoading, user, sessionExpired, router])

  // Show loading screen until everything is initialized
  if (!isDbReady || !isInitialized || authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          {!isDbReady ? "Initializing database..." : !isInitialized ? "Loading user session..." : "Starting app..."}
        </Text>
        {dbError && (
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "#ef4444",
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            Database Error: {dbError}
          </Text>
        )}
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AppProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="debt" />
          </Stack>
        </AppProvider>
      </ToastProvider>
    </SafeAreaProvider>
  )
}
