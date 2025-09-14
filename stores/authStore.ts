import { clearAuthToken, clearUserIdentifier, getAuthToken, getUserIdentifier, setAuthToken, setUserIdentifier } from "@/lib/auth"
import { authenticateWithBiometric, checkBiometricCapabilities } from "@/services/biometricService"
import { ensureUserSettings, getSettings } from "@/services/settingsService"
import { createUser, getUserById, loginUser, updateBiometricPreference } from "@/services/userService"
import { CreateUserInput } from "@/types/user"
import { router } from "expo-router"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

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
    language: string
  }
}

type AuthState = {
  user: User | null
  loading: boolean
  biometricCapabilities: any
  isInitialized: boolean
  sessionExpired: boolean
}

type AuthActions = {
  setUser: (user: User | null) => void
  loadUser: () => Promise<void>
  login: (credentials: { identifier: string; pin: string }) => Promise<boolean>
  loginWithBiometric: () => Promise<boolean>
  register: (credentials: CreateUserInput & { pin: string; confirmPin: string }) => Promise<boolean>
  refreshUser: () => Promise<void>
  updateBiometricSetting: (enabled: boolean) => Promise<boolean>
  checkBiometricCapabilities: () => Promise<void>
  logout: () => Promise<void>
  markSessionExpired: () => void
  clearSessionExpired: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    loading: true,
    biometricCapabilities: null,
    isInitialized: false,
    sessionExpired: false,

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
            await clearUserIdentifier()
            set({ user: null, isInitialized: true, loading: false })
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
                language: settings.language,
              },
            },
            isInitialized: true,
            loading: false,
          })
        } else {
          set({ user: null, isInitialized: true, loading: false })
        }
      } catch (error) {
        console.error("Failed to load user:", error)
        await clearAuthToken()
        await clearUserIdentifier()
        set({ user: null, isInitialized: true, loading: false })
      }
    },

    login: async (credentials) => {
      try {
        set({ loading: true })
        const result = await loginUser(credentials.identifier, credentials.pin)

        if (result) {
          // Stocker l'identifiant pour la biométrie future
          await setUserIdentifier(credentials.identifier)

          const settings = await ensureUserSettings(result.user_id)
          const authData = { user_id: result.user_id }
          await setAuthToken(JSON.stringify(authData))

          const user = {
            user_id: result.user_id,
            full_name: result.full_name,
            email: result.email,
            phone_number: result.phone_number,
            biometric_enabled: result.biometric_enabled,
            settings: {
              notification_enabled: settings.notification_enabled,
              days_before_reminder: settings.days_before_reminder,
              inactivity_timeout: settings.inactivity_timeout,
              language: settings.language,
            },
          }

          set({
            user,
            sessionExpired: false,
            loading: false,
          })

          return true
        }
        set({ loading: false })
        return false
      } catch (error) {
        console.error("Login error:", error)
        set({ loading: false })
        return false
      }
    },

    loginWithBiometric: async () => {
      try {
        console.log("Starting biometric login process...")
        set({ loading: true })

        // Récupérer l'identifiant stocké
        const storedIdentifier = await getUserIdentifier()
        console.log("Stored identifier:", storedIdentifier)

        if (!storedIdentifier) {
          Toast.error("No saved credentials found. Please log in with PIN first.", "Error")
          set({ loading: false })
          return false
        }

        // Vérifier que la biométrie est disponible
        const capabilities = await checkBiometricCapabilities()
        console.log("Biometric capabilities:", capabilities)

        if (!capabilities.isAvailable) {
          Toast.error("Biometric authentication is not available on this device", "Error")
          set({ loading: false })
          return false
        }

        // Authentifier avec la biométrie
        console.log("Starting biometric authentication...")
        const biometricResult = await authenticateWithBiometric()
        console.log("Biometric result:", biometricResult)

        if (!biometricResult.success) {
          Toast.error( biometricResult.error || "Biometric authentication failed", "Authentication Failed")
          set({ loading: false })
          return false
        }

        // Maintenant, connectez-vous avec l'identifiant stocké
        // Note: Vous devrez peut-être adapter votre backend pour accepter une connexion biométrique
        // Pour l'instant, on utilise le même endpoint avec un PIN spécial
        console.log("Logging in with stored identifier:", storedIdentifier)
        const result = await loginUser(storedIdentifier, "biometric_auth")
        console.log("Login result:", result)

        if (result) {
          const settings = await ensureUserSettings(result.user_id)

          const user = {
            user_id: result.user_id,
            full_name: result.full_name,
            email: result.email,
            phone_number: result.phone_number,
            biometric_enabled: result.biometric_enabled,
            settings: {
              notification_enabled: settings.notification_enabled,
              days_before_reminder: settings.days_before_reminder,
              inactivity_timeout: settings.inactivity_timeout,
              language: settings.language,
            },
          }

          set({
            user,
            sessionExpired: false,
            loading: false,
          })

          return true
        } else {
          Toast.error("Failed to login after biometric authentication", "Error")
        }

        set({ loading: false })
        return false
      } catch (error) {
        console.error("Biometric login error:", error)
        Toast.error("An unexpected error occurred during biometric login", "Error")
        set({ loading: false })
        return false
      }
    },

    register: async (credentials) => {
      if (credentials.pin.length !== 6) {
        throw new Error("PIN must be 6 digits")
      }

      if (credentials.pin !== credentials.confirmPin) {
        throw new Error("PINs don't match")
      }

      try {
        set({ loading: true })
        const user_id = await createUser({
          full_name: credentials.full_name,
          email: credentials.email,
          phone_number: credentials.phone_number,
          pin: credentials.pin,
        })

        // Stocker l'identifiant (email ou téléphone) pour la biométrie future
        const identifier = credentials.email || credentials.phone_number
        await setUserIdentifier(identifier)

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
              language: settings.language,
            },
          },
          loading: false,
        })

        return true
      } catch (error) {
        set({ loading: false })
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
                    language: settings.language,
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
      await clearUserIdentifier()
      set({
        user: null,
        sessionExpired: false,
        loading: false,
      })
      router.replace("/")
    },

    markSessionExpired: () => {
      set({ sessionExpired: true, user: null })
    },

    clearSessionExpired: () => {
      set({ sessionExpired: false })
    },
  })),
)
