import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter, usePathname } from "expo-router"
import { useAuthStore } from "@/stores/authStore"

const LAST_ACTIVE_KEY = "lastActiveTime"

export default function useInactivityTimeout() {
  const { user, logout, markSessionExpired } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const appStateRef = useRef(AppState.currentState)
  const lastActiveTimeRef = useRef<Date>(new Date())
  const inactivityCheckRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!user?.settings?.inactivity_timeout) return

    const updateLastActiveTime = async () => {
      const now = new Date()
      lastActiveTimeRef.current = now
      await AsyncStorage.setItem(LAST_ACTIVE_KEY, now.toISOString())
    }

    const checkInactivity = async () => {
      try {
        if (!user?.settings?.inactivity_timeout) return

        const lastActiveStr = await AsyncStorage.getItem(LAST_ACTIVE_KEY)
        if (!lastActiveStr) {
          await updateLastActiveTime()
          return
        }

        const lastActive = new Date(lastActiveStr)
        const now = new Date()
        const inactiveMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60)

        console.log(`🕐 Inactive for ${inactiveMinutes.toFixed(2)} minutes (limit: ${user.settings.inactivity_timeout})`)

        if (inactiveMinutes > user.settings.inactivity_timeout) {
          console.log("🔒 Session expired due to inactivity")
          markSessionExpired()
          await logout()
          
          // Redirection vers la page appropriée
          if (!pathname.includes("auth") && pathname !== "/") {
            router.replace("/")
          }
        }
      } catch (error) {
        console.error("❌ Error checking inactivity:", error)
      }
    }

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current
      appStateRef.current = nextAppState

      console.log(`📱 App state: ${previousAppState} → ${nextAppState}`)

      if (nextAppState === "active") {
        if (previousAppState.match(/inactive|background/)) {
          // App revient au premier plan - vérifier l'inactivité
          console.log("🔍 App resumed, checking inactivity")
          await checkInactivity()
        }
        // Mise à jour du timestamp d'activité
        await updateLastActiveTime()
      } else if (nextAppState.match(/inactive|background/)) {
        // App passe en arrière-plan
        console.log("💤 App going to background, saving timestamp")
        await updateLastActiveTime()
      }
    }

    // Initialiser le timestamp
    updateLastActiveTime()

    // Écouter les changements d'état de l'app
    const subscription = AppState.addEventListener("change", handleAppStateChange)

    // Vérifier l'inactivité périodiquement quand l'app est active
    inactivityCheckRef.current = setInterval(() => {
      if (AppState.currentState === "active" && user) {
        updateLastActiveTime()
        checkInactivity()
      }
    }, 30000) // Vérifier toutes les 30 secondes

    return () => {
      subscription?.remove()
      if (inactivityCheckRef.current) {
        clearInterval(inactivityCheckRef.current)
      }
    }
  }, [user?.settings?.inactivity_timeout, user?.user_id, logout, markSessionExpired, router, pathname])

  // Nettoyage si l'utilisateur se déconnecte
  useEffect(() => {
    if (!user && inactivityCheckRef.current) {
      clearInterval(inactivityCheckRef.current)
    }
  }, [user])
}

// Hook séparé pour gérer l'authentification au démarrage
export const useAppStartup = () => {
  const { user, loadUser, checkBiometricCapabilities, isInitialized, sessionExpired, clearSessionExpired } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing app...")
        
        // Charger les capacités biométriques
        await checkBiometricCapabilities()

        // Charger l'utilisateur depuis le storage
        await loadUser()
        
        console.log("✅ App initialized")
      } catch (error) {
        console.error("❌ Error during app startup:", error)
      }
    }

    initializeApp()
  }, [checkBiometricCapabilities, loadUser])

  useEffect(() => {
    if (!isInitialized) return

    const handleAuthRedirect = () => {
      console.log(`🔄 Auth redirect check - User: ${!!user}, Path: ${pathname}, SessionExpired: ${sessionExpired}`)

      if (sessionExpired) {
        clearSessionExpired()
        if (pathname !== "/" && !pathname.includes("auth")) {
          console.log("🔒 Redirecting to home due to expired session")
          router.replace("/")
        }
        return
      }

      if (user) {
        // Utilisateur connecté
        if (pathname === "/" || (pathname.includes("auth") && !pathname.includes("change-pin"))) {
          console.log("➡️ Redirecting authenticated user to dashboard")
          router.replace("/(tabs)/dashboard")
        }
      } else {
        // Utilisateur non connecté
        if (!pathname.includes("auth") && pathname !== "/") {
          console.log("➡️ Redirecting unauthenticated user to home")
          router.replace("/")
        }
      }
    }

    // Petit délai pour éviter les conflits de navigation
    const timeout = setTimeout(handleAuthRedirect, 100)
    return () => clearTimeout(timeout)
  }, [user, isInitialized, sessionExpired, router, pathname, clearSessionExpired])
}