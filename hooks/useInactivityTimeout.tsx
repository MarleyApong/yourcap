import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter, usePathname } from "expo-router"
import { useAuthStore } from "@/stores/authStore"

const LAST_ACTIVE_KEY = "lastActiveTime"
const INACTIVITY_TIMEOUT_KEY = "inactivityTimeout"

export function useInactivityTimeout() {
  const { user, logout, markSessionExpired } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const appStateRef = useRef(AppState.currentState)
  const inactivityCheckRef = useRef<number | null>(null)

  useEffect(() => {
    if (!user) return

    const updateLastActiveTime = async () => {
      const now = new Date()
      await AsyncStorage.setItem(LAST_ACTIVE_KEY, now.toISOString())
      console.log("✅ Last active time updated:", now)
    }

    const checkInactivity = async () => {
      try {
        // Récupérer le timeout d'inactivité depuis les settings ou AsyncStorage
        let inactivityTimeout = user.settings?.inactivity_timeout ?? 30 // 30 minutes par défaut

        // Vérifier s'il y a une valeur dans AsyncStorage (pour les cas où les settings ne sont pas encore chargées)
        const storedTimeout = await AsyncStorage.getItem(INACTIVITY_TIMEOUT_KEY)
        if (storedTimeout) {
          inactivityTimeout = parseInt(storedTimeout, 10)
        }

        // Si le timeout est 0, déconnecter immédiatement quand l'app passe en arrière-plan
        if (inactivityTimeout === 0) {
          console.log("⚡ Immediate logout on background")
          return
        }

        const lastActiveStr = await AsyncStorage.getItem(LAST_ACTIVE_KEY)
        if (!lastActiveStr) {
          await updateLastActiveTime()
          return
        }

        const lastActive = new Date(lastActiveStr)
        const now = new Date()
        const inactiveMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60)

        console.log(`🕐 Inactive for ${inactiveMinutes.toFixed(2)} minutes (limit: ${inactivityTimeout})`)

        if (inactiveMinutes > inactivityTimeout) {
          console.log("🔒 Session expired due to inactivity")
          markSessionExpired()
          await logout()

          // Redirection vers la page de login
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
        // App revient au premier plan
        console.log("🔍 App resumed, checking inactivity")
        await checkInactivity()
        await updateLastActiveTime()
      } else if (nextAppState.match(/inactive|background/)) {
        // App passe en arrière-plan
        console.log("💤 App going to background")

        // Vérifier le timeout immédiat
        const inactivityTimeout = user.settings?.inactivity_timeout ?? 30
        if (inactivityTimeout === 0) {
          // Déconnexion immédiate
          console.log("⚡ Immediate logout triggered")
          markSessionExpired()
          await logout()
          if (!pathname.includes("auth") && pathname !== "/") {
            router.replace("/")
          }
        } else {
          // Sauvegarder le timestamp
          await updateLastActiveTime()
        }
      }
    }

    // Initialiser le timestamp
    updateLastActiveTime()

    // Écouter les changements d'état de l'app
    const subscription = AppState.addEventListener("change", handleAppStateChange)

    // Vérifier l'inactivité périodiquement quand l'app est active
    inactivityCheckRef.current = setInterval(() => {
      if (AppState.currentState === "active" && user) {
        checkInactivity()
      }
    }, 30000) as unknown as number

    return () => {
      subscription?.remove()
      if (inactivityCheckRef.current) {
        clearInterval(inactivityCheckRef.current)
      }
    }
  }, [user?.settings?.inactivity_timeout, user?.user_id, logout, markSessionExpired, router, pathname])

  // Sauvegarder le timeout d'inactivité quand il change
  useEffect(() => {
    const saveInactivityTimeout = async () => {
      if (user?.settings?.inactivity_timeout !== undefined) {
        await AsyncStorage.setItem(INACTIVITY_TIMEOUT_KEY, user.settings.inactivity_timeout.toString())
        console.log("✅ Inactivity timeout saved:", user.settings.inactivity_timeout)
      }
    }

    saveInactivityTimeout()
  }, [user?.settings?.inactivity_timeout])

  // Nettoyage si l'utilisateur se déconnecte
  useEffect(() => {
    if (!user && inactivityCheckRef.current) {
      clearInterval(inactivityCheckRef.current)
      inactivityCheckRef.current = null
    }
  }, [user])
}

// Hook séparé pour gérer l'authentification au démarrage - MAINTENANT SIMPLIFIÉ
export const useAppStartup = () => {
  const { user, isInitialized, sessionExpired, clearSessionExpired } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

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
