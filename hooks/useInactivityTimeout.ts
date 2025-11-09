import { isAppLocked, setAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import { useSettings } from "./useSettings"

export const useInactivityTimeout = () => {
  const appState = useRef(AppState.currentState)
  const lockTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuthStore()
  const { settings } = useSettings()

  useEffect(() => {
    if (!user) return

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log("InactivityTimeout - App state changed:", appState.current, "->", nextAppState)

      // Quand l'app passe en arrière-plan - VERROUILLER AVEC DÉLAI
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        const delaySeconds = settings?.background_lock_delay ?? 5
        console.log(`InactivityTimeout - Scheduling lock in ${delaySeconds} seconds`)
        
        if (delaySeconds === 0) {
          // Verrouillage immédiat
          console.log("InactivityTimeout - Locking app immediately")
          await setAppLocked(true)
        } else {
          // Verrouillage avec délai
          lockTimeout.current = setTimeout(async () => {
            console.log("InactivityTimeout - Locking app after delay")
            await setAppLocked(true)
          }, delaySeconds * 1000)
        }
      }

      // Quand l'app revient au premier plan - NE PAS DÉVERROUILLER AUTOMATIQUEMENT
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("InactivityTimeout - App coming to foreground")
        
        // Annuler le timeout de verrouillage si l'app revient au premier plan
        if (lockTimeout.current) {
          console.log("InactivityTimeout - Cancelling scheduled lock")
          clearTimeout(lockTimeout.current)
          lockTimeout.current = null
        }
        
        const locked = await isAppLocked()
        console.log("InactivityTimeout - Lock status:", locked)
        // L'AppLockScreen gérera l'affichage du PIN/fingerprint
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription.remove()
      // Nettoyer le timeout si le composant est démonté
      if (lockTimeout.current) {
        clearTimeout(lockTimeout.current)
      }
    }
  }, [user, settings?.background_lock_delay])
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
