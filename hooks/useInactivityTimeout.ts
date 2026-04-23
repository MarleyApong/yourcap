import { isAppLocked, setAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { useCallback, useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

export const useInactivityTimeout = () => {
  const appState = useRef(AppState.currentState)
  const bgLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuthStore()

  const requireAuth = useAuthStore((s) => s.user?.settings?.require_auth ?? true)
  const backgroundLockDelay = useAuthStore((s) => s.user?.settings?.background_lock_delay ?? 5)
  const inactivityTimeout = useAuthStore((s) => s.user?.settings?.inactivity_timeout ?? 30) // minutes

  const resetInactivityTimer = useCallback(() => {
    if (!user || !requireAuth || inactivityTimeout <= 0) return
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(async () => {
      await setAppLocked(true)
    }, inactivityTimeout * 60 * 1000)
  }, [user, requireAuth, inactivityTimeout])

  // Start inactivity timer whenever user/settings change
  useEffect(() => {
    if (!user || !requireAuth) {
      if (inactivityTimer.current) { clearTimeout(inactivityTimer.current); inactivityTimer.current = null }
      return
    }
    resetInactivityTimer()
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [user, requireAuth, resetInactivityTimer])

  // Background lock logic
  useEffect(() => {
    if (!user) return

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        if (!requireAuth) return

        // Pause inactivity timer while app is in background
        if (inactivityTimer.current) { clearTimeout(inactivityTimer.current); inactivityTimer.current = null }

        if (bgLockTimer.current) { clearTimeout(bgLockTimer.current); bgLockTimer.current = null }

        if (backgroundLockDelay === 0) {
          await setAppLocked(true)
        } else {
          bgLockTimer.current = setTimeout(() => setAppLocked(true), backgroundLockDelay * 1000)
        }
      }

      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (bgLockTimer.current) { clearTimeout(bgLockTimer.current); bgLockTimer.current = null }
        // Restart inactivity timer when app returns to foreground
        resetInactivityTimer()
        await isAppLocked()
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => {
      subscription.remove()
      if (bgLockTimer.current) clearTimeout(bgLockTimer.current)
    }
  }, [user, requireAuth, backgroundLockDelay, resetInactivityTimer])

  return { resetInactivityTimer }
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
