import { Stack } from "expo-router"
import { useFonts } from "expo-font"
import { useEffect, useState } from "react"
import * as SplashScreen from "expo-splash-screen"
import { ToastProvider } from "@/components/ui/toast/toast-provider"
import { useInactivityTimeout, useAppStartup } from "@/hooks/useInactivityTimeout"
import { initDb } from "@/db/db"
import { useAuthStore } from "@/stores/authStore"
import AppLockScreen from "@/components/feature/app-lock-screen"
import { useNotificationHandler } from "@/hooks/useNotificationHandler"
import "react-native-get-random-values"
import "../global.css"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  const [dbInitialized, setDbInitialized] = useState(false)
  const { loadUser, user, loading, isInitialized } = useAuthStore()

  // Use hooks - l'ordre est important
  useNotificationHandler()
  useAppStartup()
  useInactivityTimeout()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (error) throw error
        if (!fontsLoaded) return

        console.log("Starting app initialization...")

        console.log("Initializing database...")
        await initDb()
        setDbInitialized(true)
        console.log("Database initialized successfully")

        console.log("Loading user...")
        await loadUser()
        console.log("App initialization completed")

        // Cacher le splash screen une fois tout initialisé
        await SplashScreen.hideAsync()
      } catch (error) {
        console.error("App initialization failed:", error)
        await SplashScreen.hideAsync()
      }
    }

    initializeApp()
  }, [fontsLoaded, error])

  // Afficher null pendant le chargement initial
  if (!fontsLoaded || !dbInitialized || !isInitialized) {
    return null
  }

  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "#000000",
          },
          headerShown: false,
        }}
      >
        {/* Routes principales */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="debt" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>

      {/* App Lock Screen - s'affiche par-dessus tout quand nécessaire */}
      <AppLockScreen />
    </ToastProvider>
  )
}
