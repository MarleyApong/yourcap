import { useEffect } from "react"
import { AppState } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useAuth } from "./useAuth"

function useInactivityTimeout() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkInactivity = async () => {
      try {
        const [lastActive, timeout] = await Promise.all([AsyncStorage.getItem("lastActiveTime"), AsyncStorage.getItem("inactivityTimeout")])

        if (lastActive) {
          const inactiveMinutes = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60)
          const timeoutMinutes = timeout ? parseInt(timeout) : 30 // 30 min par défaut

          if (inactiveMinutes > timeoutMinutes) {
            logout()
            router.replace("/")
          }
        }
      } catch (error) {
        console.error("Error checking inactivity:", error)
      }
    }

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
        AsyncStorage.setItem("lastActiveTime", new Date().toISOString())
      } else if (nextAppState === "active") {
        checkInactivity()
      }
    })

    return () => subscription.remove()
  }, [logout, router])
}

export default useInactivityTimeout
