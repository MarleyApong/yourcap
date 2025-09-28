import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"
import { useAuthStore } from "@/stores/authStore"
import { setAppLocked } from "@/lib/auth"
import { useRouter, usePathname } from "expo-router"

export function useInactivityTimeout() {
  const { user, logout, markSessionExpired } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const appStateRef = useRef(AppState.currentState)

  useEffect(() => {
    if (!user) return

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current
      appStateRef.current = nextAppState

      console.log(`App state: ${previousAppState} → ${nextAppState}`)

      if (nextAppState === "active") {
        // App comes to foreground - check if we need to show auth
        console.log("App resumed - checking auth requirement")
      } else if (nextAppState.match(/inactive|background/)) {
        // App goes to background - immediately lock the app
        console.log("App going to background - locking")
        await setAppLocked(true)
        
        // Check inactivity timeout setting
        const inactivityTimeout = user.settings?.inactivity_timeout ?? 30
        
        if (inactivityTimeout === 0) {
          // Immediate logout when app goes to background
          console.log("Immediate logout triggered")
          markSessionExpired()
          await logout()
        }
      }
    }

    // Listen to app state changes
    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription?.remove()
    }
  }, [user?.settings?.inactivity_timeout, user?.user_id, logout, markSessionExpired, router, pathname])
}

// Simplified app startup hook
export const useAppStartup = () => {
  const { user, isInitialized, sessionExpired, clearSessionExpired, loadUser } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isInitialized) return

    const handleAuthRedirect = async () => {
      console.log(`Auth redirect check - User: ${!!user}, Path: ${pathname}, SessionExpired: ${sessionExpired}`)

      // Check if app was locked and we have a user
      if (user) {
        const wasLocked = await import("@/lib/auth").then(auth => auth.isAppLocked())
        if (wasLocked && !pathname.includes("auth")) {
          // Force user to login page for re-authentication
          console.log("App was locked, redirecting to login for re-auth")
          router.replace("/auth/login")
          return
        }
      }

      if (sessionExpired) {
        clearSessionExpired()
        if (pathname !== "/" && !pathname.includes("auth")) {
          console.log("Redirecting to home due to expired session")
          router.replace("/")
        }
        return
      }

      if (user) {
        // User is authenticated
        if (pathname === "/" || (pathname.includes("auth") && !pathname.includes("change-pin"))) {
          console.log("Redirecting authenticated user to dashboard")
          router.replace("/(tabs)/dashboard")
        }
      } else {
        // User not authenticated
        if (!pathname.includes("auth") && pathname !== "/") {
          console.log("Redirecting unauthenticated user to home")
          router.replace("/")
        }
      }
    }

    // Small delay to avoid navigation conflicts
    const timeout = setTimeout(handleAuthRedirect, 100)
    return () => clearTimeout(timeout)
  }, [user, isInitialized, sessionExpired, router, pathname, clearSessionExpired])
}