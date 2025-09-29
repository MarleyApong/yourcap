import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import { useAuthStore } from "@/stores/authStore"
import { setAppLocked } from "@/lib/auth"

export const useAppStateHandler = () => {
  const appState = useRef(AppState.currentState)
  const { user } = useAuthStore()

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log("AppStateHandler - State change:", appState.current, "->", nextAppState)

      // Application va en arrière-plan
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        console.log("AppStateHandler - Locking app due to background state")
        if (user) {
          await setAppLocked(true)
        }
      }

      // Application revient au premier plan
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("AppStateHandler - App returned to foreground")
        // Le AppLockScreen vérifiera automatiquement l'état du verrouillage
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [user])
}
