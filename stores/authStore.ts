import { create } from "zustand"
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/auth"
import { createUser, loginUser, getUserById } from "@/services/userService"
import { getSettings, ensureUserSettings } from "@/services/settingsService"
import { CreateUserInput } from "@/types/user"
import Toast from "react-native-toast-message"
import { router } from "expo-router"

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

type AuthState = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  loadUser: () => Promise<void>
  login: (credentials: { identifier: string; password: string }) => Promise<boolean>
  register: (credentials: CreateUserInput & { confirmPassword: string }) => Promise<boolean>
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,

  setUser: (user) => set({ user }),

  loadUser: async () => {
    try {
      set({loading: true})
      const storedAuth = await getAuthToken()
      if (storedAuth) {
        const authData = JSON.parse(storedAuth)

        const userData = await getUserById(authData.user_id)
        if (!userData) {
          await clearAuthToken()
          set({ user: null })
          return
        }

        const settings = await ensureUserSettings(authData.user_id)

        set({
          user: { ...userData, settings },
        })
      }
    } catch (error) {
      console.error("Failed to load user:", error)
      await clearAuthToken()
      set({ user: null })
    } finally {
      set({ loading: false })
    }
  },

  login: async (credentials) => {
    try {
      const result = await loginUser(credentials.identifier, credentials.password)
      if (result) {
        const settings = await ensureUserSettings(result.user_id)

        const authData = { user_id: result.user_id }
        await setAuthToken(JSON.stringify(authData))

        set({
          user: {
            user_id: result.user_id,
            full_name: result.full_name,
            email: result.email,
            phone_number: result.phone_number,
            settings,
          },
        })

        Toast.show({ type: "success", text1: "Success", text2: "Login successful!" })
        return true
      }
      return false
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Login failed" })
      return false
    }
  },

  register: async (credentials) => {
    if (credentials.password !== credentials.confirmPassword) {
      Toast.show({ type: "error", text1: "Error", text2: "Passwords don't match" })
      throw new Error("Passwords don't match")
    }

    try {
      const user_id = await createUser(credentials)
      const settings = await ensureUserSettings(user_id)

      const authData = { user_id }
      await setAuthToken(JSON.stringify(authData))

      set({
        user: {
          user_id,
          full_name: credentials.full_name,
          email: credentials.email,
          phone_number: credentials.phone_number,
          settings,
        },
      })

      Toast.show({ type: "success", text1: "Success", text2: "Registration successful!" })
      return true
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Registration failed" })
      throw error
    }
  },

  refreshUser: async () => {
    const { user } = get()
    if (!user) return

    try {
      const userData = await getUserById(user.user_id)
      const settings = await getSettings(user.user_id)

      if (userData) {
        set({
          user: {
            ...userData,
            settings: settings || user.settings,
          },
        })
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  },

  logout: async () => {
    await clearAuthToken()
    set({ user: null })
    Toast.show({ type: "success", text1: "Success", text2: "Logged out successfully" })
    router.replace("/")
  },
}))
