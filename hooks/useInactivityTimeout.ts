import { useAuthStore } from "@/stores/authStore"
import { useCallback, useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

export const useInactivityTimeout = () => {
  const appState = useRef(AppState.currentState)
  // Timestamp (ms) when the app went to background — null if not in background
  const bgTimestamp = useRef<number | null>(null)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuthStore()

  const requireAuth = useAuthStore((s) => s.user?.settings?.require_auth ?? true)
  const backgroundLockDelay = useAuthStore((s) => s.user?.settings?.background_lock_delay ?? 5)
  const inactivityTimeout = useAuthStore((s) => s.user?.settings?.inactivity_timeout ?? 30)

  const resetInactivityTimer = useCallback(() => {
    if (!user || !requireAuth || inactivityTimeout <= 0) return
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(async () => {
      // Use the store action so Zustand state updates and AppLockScreen reacts immediately
      await useAuthStore.getState().setAppLocked(true)
    }, inactivityTimeout * 60 * 1000)
  }, [user, requireAuth, inactivityTimeout])

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

  useEffect(() => {
    if (!user) return

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        if (!requireAuth) { appState.current = nextAppState; return }

        if (inactivityTimer.current) { clearTimeout(inactivityTimer.current); inactivityTimer.current = null }

        if (backgroundLockDelay === 0) {
          // Immediate lock — still reliable to call directly here
          await useAuthStore.getState().setAppLocked(true)
        } else {
          // Store the timestamp instead of a background timer (JS timers are paused by iOS in background)
          bgTimestamp.current = Date.now()
        }
      }

      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // Compare elapsed time against delay — works regardless of iOS background suspension
        if (requireAuth && bgTimestamp.current !== null) {
          const elapsedSeconds = (Date.now() - bgTimestamp.current) / 1000
          if (elapsedSeconds >= backgroundLockDelay) {
            await useAuthStore.getState().setAppLocked(true)
          }
        }
        bgTimestamp.current = null
        resetInactivityTimer()
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription.remove()
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
