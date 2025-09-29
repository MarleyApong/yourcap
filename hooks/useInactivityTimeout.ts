import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import { useAuthStore } from "@/stores/authStore"
import { setAppLocked, isAppLocked } from "@/lib/auth"

export const useInactivityTimeout = () => {
  const appState = useRef(AppState.currentState)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) return

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log("App state changed:", appState.current, "->", nextAppState)

      // Quand l'app passe en arrière-plan - VERROUILLER
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        console.log("App going to background - locking app")
        await setAppLocked(true)
      }

      // Quand l'app revient au premier plan - NE PAS DÉVERROUILLER AUTOMATIQUEMENT
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        const locked = await isAppLocked()
        console.log("App coming to foreground - lock status:", locked)
        // L'AppLockScreen gérera l'affichage du PIN/fingerprint
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [user])
}

export const useAppStartup = () => {
  const { user, checkAppLock } = useAuthStore()

  useEffect(() => {
    const initializeAppLock = async () => {
      if (user) {
        const locked = await checkAppLock()
        console.log("App startup - User exists, app locked:", locked)
      }
    }

    initializeAppLock()
  }, [user])
}
