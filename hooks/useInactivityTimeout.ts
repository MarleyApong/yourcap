import { isAppLocked, setAppLocked } from "@/lib/auth"
import { useAuthStore } from "@/stores/authStore"
import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

export const useInactivityTimeout = () => {
  const appState = useRef(AppState.currentState)
  const lockTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { user } = useAuthStore()

  // Read directly from authStore so changes in settings screen take effect immediately
  const requireAuth = useAuthStore((s) => s.user?.settings?.require_auth ?? true)
  const backgroundLockDelay = useAuthStore((s) => s.user?.settings?.background_lock_delay ?? 5)

  useEffect(() => {
    if (!user) return

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        if (!requireAuth) return

        if (lockTimeout.current) {
          clearTimeout(lockTimeout.current)
          lockTimeout.current = null
        }

        if (backgroundLockDelay === 0) {
          await setAppLocked(true)
        } else {
          lockTimeout.current = setTimeout(async () => {
            await setAppLocked(true)
          }, backgroundLockDelay * 1000)
        }
      }

      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        if (lockTimeout.current) {
          clearTimeout(lockTimeout.current)
          lockTimeout.current = null
        }
        await isAppLocked()
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription.remove()
      if (lockTimeout.current) {
        clearTimeout(lockTimeout.current)
      }
    }
  }, [user, requireAuth, backgroundLockDelay])
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
