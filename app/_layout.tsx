import AppLockScreen from "@/components/feature/app-lock-screen"
import { AppUpdateModals } from "@/components/feature/app-update-modals"
import { InitialLoadingScreen } from "@/components/feature/initial-loading-screen"
import { ToastProvider } from "@/components/ui/toast/toast-provider"
import { ThemeProvider } from "@/core/providers/ThemeProvider"
import { useTheme } from "@/core/theme"
import { initDb } from "@/db/db"
import { useAppStartup, useInactivityTimeout } from "@/hooks/useInactivityTimeout"
import { useNotificationHandler } from "@/hooks/useNotificationHandler"
import { isAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { View } from "react-native"
import "react-native-get-random-values"

function NavigationStack() {
  const { colors } = useTheme()
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background.primary },
        headerShown: false,
        animation: "fade",
        animationDuration: 220,
      }}
    >
      <Stack.Screen name="index" options={{ animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      <Stack.Screen name="auth" options={{ animation: "fade_from_bottom" }} />
      <Stack.Screen name="debt" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  const [dbInitialized, setDbInitialized] = useState(false)
  const [lockCheckComplete, setLockCheckComplete] = useState(false)
  const { loadUser, user, loading, isInitialized, appLocked } = useAuthStore()

  // Use hooks - l'ordre est important
  useNotificationHandler()
  useAppStartup()
  const { resetInactivityTimer } = useInactivityTimeout()

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
        
        // Vérifier immédiatement le statut de verrouillage après loadUser
        const lockStatus = await isAppLocked()
        console.log("Initial lock check complete:", lockStatus)
        setLockCheckComplete(true)
        
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

  // Si l'utilisateur est connecté, attendre la vérification du verrouillage
  // avant d'afficher quoi que ce soit pour éviter le flash
  if (user && !lockCheckComplete) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <InitialLoadingScreen />
        </ToastProvider>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <View style={{ flex: 1 }} onTouchStart={resetInactivityTimer}>
          <NavigationStack />

          {/* App Lock Screen - s'affiche par-dessus tout quand nécessaire */}
          <AppLockScreen />
          {/* Changelog + T&C update modals - s'affiche après connexion si nécessaire */}
          <AppUpdateModals />
        </View>
      </ToastProvider>
    </ThemeProvider>
  )
}
