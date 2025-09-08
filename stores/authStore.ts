import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth"
import { ensureUserSettings, getSettings } from "@/services/settingsService"
import { createUser, getUserById, loginUser, updateBiometricPreference } from "@/services/userService"
import { authenticateWithBiometric, checkBiometricCapabilities } from "@/services/biometricService"
import { CreateUserInput } from "@/types/user"
import { router } from "expo-router"
import { create } from "zustand"

type User = {
  user_id: string
  full_name: string
  email: string
  phone_number: string
  biometric_enabled: boolean
  settings?: {
    notification_enabled: boolean
    days_before_reminder: number
    inactivity_timeout: number
  }
}

type AuthState = {
  user: User | null
  loading: boolean
  biometricCapabilities: any
  setUser: (user: User | null) => void
  loadUser: () => Promise<void>
  login: (credentials: { identifier: string; pin: string }) => Promise<boolean>
  loginWithBiometric: () => Promise<boolean>
  register: (credentials: CreateUserInput & { pin: string; confirmPin: string }) => Promise<boolean>
  refreshUser: () => Promise<void>
  updateBiometricSetting: (enabled: boolean) => Promise<boolean>
  checkBiometricCapabilities: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  biometricCapabilities: null,

  setUser: (user) => set({ user }),

  loadUser: async () => {
    try {
      set({ loading: true })
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
          user: {
            ...userData,
            settings: {
              notification_enabled: settings.notification_enabled,
              days_before_reminder: settings.days_before_reminder,
              inactivity_timeout: settings.inactivity_timeout,
            },
          },
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
      const result = await loginUser(credentials.identifier, credentials.pin)
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
            biometric_enabled: result.biometric_enabled,
            settings: {
              notification_enabled: settings.notification_enabled,
              days_before_reminder: settings.days_before_reminder,
              inactivity_timeout: settings.inactivity_timeout,
            },
          },
        })

        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  },

  loginWithBiometric: async () => {
    try {
      const storedAuth = await getAuthToken()
      if (!storedAuth) return false

      const authData = JSON.parse(storedAuth)
      const userData = await getUserById(authData.user_id)

      if (!userData || !userData.biometric_enabled) return false

      const biometricResult = await authenticateWithBiometric()
      if (biometricResult.success) {
        const settings = await ensureUserSettings(authData.user_id)

        set({
          user: {
            ...userData,
            settings: {
              notification_enabled: settings.notification_enabled,
              days_before_reminder: settings.days_before_reminder,
              inactivity_timeout: settings.inactivity_timeout,
            },
          },
        })

        return true
      }

      return false
    } catch (error) {
      console.error("Biometric login error:", error)
      return false
    }
  },

  register: async (credentials) => {
    if (credentials.pin.length !== 6) {
      Alert.error("PIN must be 6 digits", "Error")
      throw new Error("PIN must be 6 digits")
    }

    if (credentials.pin !== credentials.confirmPin) {
      Alert.error("PINs don't match", "Error")
      throw new Error("PINs don't match")
    }

    try {
      const user_id = await createUser({
        full_name: credentials.full_name,
        email: credentials.email,
        phone_number: credentials.phone_number,
        pin: credentials.pin,
      })

      const settings = await ensureUserSettings(user_id)
      const authData = { user_id }
      await setAuthToken(JSON.stringify(authData))

      set({
        user: {
          user_id,
          full_name: credentials.full_name,
          email: credentials.email,
          phone_number: credentials.phone_number,
          biometric_enabled: false,
          settings: {
            notification_enabled: settings.notification_enabled,
            days_before_reminder: settings.days_before_reminder,
            inactivity_timeout: settings.inactivity_timeout,
          },
        },
      })

      Alert.success("Registration successful!", "Success")
      return true
    } catch (error) {
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
            settings: settings
              ? {
                  notification_enabled: settings.notification_enabled,
                  days_before_reminder: settings.days_before_reminder,
                  inactivity_timeout: settings.inactivity_timeout,
                }
              : user.settings,
          },
        })
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  },

  updateBiometricSetting: async (enabled: boolean) => {
    const { user } = get()
    if (!user) return false

    try {
      const success = await updateBiometricPreference(user.user_id, enabled)
      if (success) {
        set({
          user: {
            ...user,
            biometric_enabled: enabled,
          },
        })
        Alert.success(enabled ? "Biometric authentication enabled" : "Biometric authentication disabled", "Success")
      }
      return success
    } catch (error) {
      console.error("Failed to update biometric setting:", error)
      return false
    }
  },

  checkBiometricCapabilities: async () => {
    try {
      const capabilities = await checkBiometricCapabilities()
      set({ biometricCapabilities: capabilities })
    } catch (error) {
      console.error("Failed to check biometric capabilities:", error)
    }
  },

  logout: async () => {
    await clearAuthToken()
    set({ user: null })
    Alert.success("Logged out successfully", "Success")
    router.replace("/")
  },
}))
