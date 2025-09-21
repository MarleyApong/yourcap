import { ToastProvider } from "@/components/ui/toast"
import { AppProvider } from "@/contexts/AppContext"
import { initDb, isDatabaseReady } from "@/db/db"
import useInactivityTimeout, { useAppStartup } from "@/hooks/useInactivityTimeout"
import { useAuthStore } from "@/stores/authStore"
import { Stack, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
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
  const { user, isInitialized, loading: authLoading, sessionExpired, loadUser } = useAuthStore()
  const router = useRouter()
  const hasInitializedRef = useRef(false)
  const lastNavigationRef = useRef<string>("")

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
        setIsDbReady(true) // On continue même en cas d'erreur pour ne pas bloquer l'app
      }
    }

    initializeDatabase()
  }, [])

  // Load user once database is ready
  useEffect(() => {
    if (isDbReady && !hasInitializedRef.current) {
      console.log("🔄 Database ready, loading user...")
      hasInitializedRef.current = true
      loadUser()
    }
  }, [isDbReady, loadUser])

  // Use the app startup hook (authentication)
  useAppStartup()

  // Use the inactivity timeout hook
  useInactivityTimeout()

  useDrizzleStudio(expoDb)

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isDbReady || !isInitialized || authLoading) {
      console.log("🔄 Not ready for navigation:", { isDbReady, isInitialized, authLoading })
      return
    }

    console.log("🔄 Navigation check:", {
      user: !!user,
      sessionExpired,
    })

    let targetRoute = ""

    if (sessionExpired) {
      targetRoute = "/auth/login"
      console.log("🔒 Session expired, redirecting to login")
    } else if (user) {
      targetRoute = "/(tabs)/dashboard"
      console.log("✅ User authenticated, redirecting to dashboard")
    } else {
      targetRoute = "/auth/login"
      console.log("🔒 No user, redirecting to login")
    }

    // Éviter les navigations redondantes
    if (lastNavigationRef.current !== targetRoute) {
      console.log(`🚀 Navigating to: ${targetRoute}`)
      lastNavigationRef.current = targetRoute
      
      // Utiliser un setTimeout pour éviter les conflits de navigation
      const timer = setTimeout(() => {
        router.replace(targetRoute as any)
      }, 100)

      return () => clearTimeout(timer)
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
          {!isDbReady 
            ? "Initializing database..." 
            : !isInitialized 
            ? "Loading user session..." 
            : "Starting app..."
          }
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