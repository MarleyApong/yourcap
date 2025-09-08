import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter, usePathname } from "expo-router"
import { useAuthStore } from "@/stores/authStore"

export default function useInactivityTimeout() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const appStateRef = useRef(AppState.currentState)
  const lastActiveTimeRef = useRef<Date>(new Date())

  useEffect(() => {
    if (!user) return

    const updateLastActiveTime = async () => {
      const now = new Date()
      lastActiveTimeRef.current = now
      await AsyncStorage.setItem("lastActiveTime", now.toISOString())
    }

    const checkInactivity = async () => {
      try {
        if (!user?.settings?.inactivity_timeout) return

        const lastActiveStr = await AsyncStorage.getItem("lastActiveTime")
        if (!lastActiveStr) return

        const lastActive = new Date(lastActiveStr)
        const now = new Date()
        const inactiveMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60)

        console.log(`Inactive for ${inactiveMinutes.toFixed(2)} minutes`)

        if (inactiveMinutes > user.settings.inactivity_timeout) {
          console.log("Session expired due to inactivity")
          await logout()
          router.replace("/")
        }
      } catch (error) {
        console.error("Error checking inactivity:", error)
      }
    }

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current
      appStateRef.current = nextAppState

      console.log(`App state changed from ${previousAppState} to ${nextAppState}`)

      if (previousAppState === "active" && nextAppState.match(/inactive|background/)) {
        // App est passé en arrière-plan
        console.log("App went to background, saving timestamp")
        await updateLastActiveTime()
      } else if (previousAppState.match(/inactive|background/) && nextAppState === "active") {
        // App revient au premier plan
        console.log("App came to foreground, checking inactivity")
        await checkInactivity()
      }
    }

    // Initialiser le timestamp au démarrage
    updateLastActiveTime()

    // Écouter les changements d'état de l'app
    const subscription = AppState.addEventListener("change", handleAppStateChange)

    // Vérifier périodiquement l'inactivité quand l'app est active
    const interval = setInterval(() => {
      if (AppState.currentState === "active") {
        updateLastActiveTime()
      }
    }, 60000) // Mettre à jour chaque minute

    return () => {
      subscription?.remove()
      clearInterval(interval)
    }
  }, [user, logout, router])

  // Force logout if user becomes null (logged out elsewhere)
  useEffect(() => {
    if (!user && AppState.currentState === "active") {
      if (!pathname.includes("auth") && pathname !== "/") {
        router.replace("/")
      }
    }
  }, [user, router, pathname])
}

// Hook séparé pour gérer l'authentification au démarrage
export const useAppStartup = () => {
  const { user, loadUser, checkBiometricCapabilities } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Charger les capacités biométriques
        await checkBiometricCapabilities()

        // Charger l'utilisateur depuis le storage
        await loadUser()
      } catch (error) {
        console.error("Error during app startup:", error)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    // Rediriger selon l'état d'authentification
    const handleAuthRedirect = async () => {
      if (user && !pathname.includes("(tabs)")) {
        // Utilisateur connecté mais pas sur les onglets principaux
        if (!pathname.includes("auth")) {
          router.replace("/(tabs)/dashboard")
        }
      } else if (!user && !pathname.includes("auth") && pathname !== "/") {
        // Utilisateur non connecté mais pas sur les pages d'auth
        router.replace("/")
      }
    }

    // Délai pour éviter les conflits de navigation
    const timeout = setTimeout(handleAuthRedirect, 100)
    return () => clearTimeout(timeout)
  }, [user, router, pathname])
}
