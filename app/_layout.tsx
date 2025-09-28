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

  // Use both hooks
  useInactivityTimeout()
  useAppStartup()
  useNotificationHandler()

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
        await useAuthStore.getState().loadUser()
        console.log("App initialization completed")

        await SplashScreen.hideAsync()
      } catch (error) {
        console.error("App initialization failed:", error)
        await SplashScreen.hideAsync()
      }
    }

    initializeApp()
  }, [fontsLoaded, error])

  if (!fontsLoaded || !dbInitialized) {
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
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="debt" />
        <Stack.Screen name="+not-found" />
      </Stack>

      <AppLockScreen />
    </ToastProvider>
  )
}
