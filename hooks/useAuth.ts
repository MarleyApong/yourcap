import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/auth"
import { createUser, loginUser } from "@/services/userService"
import { CreateUserInput } from "@/types/user"
import Toast from "react-native-toast-message"
import { getSettings } from "@/services/settingsService"

type User = {
  user_id: string
  full_name: string
  email: string
  phone_number: string
  settings?: {
    currency: string
    notification_enabled: boolean
    days_before_reminder: number
    inactivity_timeout: number
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getAuthToken()
        if (token) {
          const userData = JSON.parse(token)
          const settings = await getSettings(userData.user_id)
          setUser({
            ...userData,
            settings: settings || {
              currency: "USD",
              notification_enabled: true,
              days_before_reminder: 3,
              inactivity_timeout: 30,
            },
          })
        }
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (credentials: { identifier: string; password: string }) => {
    try {
      const result = await loginUser(credentials.identifier, credentials.password)
      if (result) {
        const settings = await getSettings(result.user_id)
        const authUser = {
          ...result,
          settings: settings || {
            currency: "USD",
            notification_enabled: true,
            days_before_reminder: 3,
            inactivity_timeout: 30,
          },
        }
        await setAuthToken(JSON.stringify(authUser))
        setUser(authUser)
        Toast.show({ type: "success", text1: "Success", text2: "Login successful!" })
        return true
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Login failed" })
      return false
    }
  }

  const register = async (credentials: CreateUserInput & { confirmPassword: string }) => {
    if (credentials.password !== credentials.confirmPassword) {
      Toast.show({ type: "error", text1: "Error", text2: "Passwords don't match" })
      throw new Error("Passwords don't match")
    }

    try {
      const user_id = await createUser(credentials)
      const authUser = {
        user_id,
        full_name: credentials.full_name,
        email: credentials.email,
        phone_number: credentials.phone_number,
      }
      await setAuthToken(JSON.stringify(authUser))
      setUser({ ...authUser, settings: undefined })
      Toast.show({ type: "success", text1: "Success", text2: "Registration successful!" })
      return true
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Registration failed" })
      throw error
    }
  }

  const logout = async () => {
    await clearAuthToken()
    setUser(null)
    Toast.show({ type: "success", text1: "Success", text2: "Logged out successfully" })
    router.replace("/")
  }

  return { user, loading, login, register, logout }
}
