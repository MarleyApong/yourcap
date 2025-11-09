import { setAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import { useSettings } from "./useSettings"

export const useAppStateHandler = () => {
  const appState = useRef(AppState.currentState)
  const lockTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuthStore()
  const { settings } = useSettings()

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log("AppStateHandler - State change:", appState.current, "->", nextAppState)

      // Application va en arrière-plan
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        const delaySeconds = settings?.background_lock_delay ?? 5
        console.log(`AppStateHandler - Scheduling lock in ${delaySeconds} seconds`)
        
        if (user) {
          if (delaySeconds === 0) {
            // Verrouillage immédiat
            await setAppLocked(true)
          } else {
            // Verrouillage avec délai
            lockTimeout.current = setTimeout(async () => {
              console.log("AppStateHandler - Locking app after delay")
              await setAppLocked(true)
            }, delaySeconds * 1000)
          }
        }
      }

      // Application revient au premier plan
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("AppStateHandler - App returned to foreground")
        
        // Annuler le timeout de verrouillage si l'app revient au premier plan
        if (lockTimeout.current) {
          console.log("AppStateHandler - Cancelling scheduled lock")
          clearTimeout(lockTimeout.current)
          lockTimeout.current = null
        }
        
        // Le AppLockScreen vérifiera automatiquement l'état du verrouillage
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
