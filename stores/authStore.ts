import { DEFAULT_SETTINGS } from "@/constants/DefaultSettings"
import { clearAuthToken, clearUserIdentifier, getAuthToken, getUserIdentifier, setAuthToken, setSessionExpiry, setUserIdentifier, isSessionValid } from "@/lib/auth"
import { authenticateWithBiometric, checkBiometricCapabilities } from "@/services/biometricService"
import { ensureUserSettings, getSettings } from "@/services/settingsService"
import { createUser, getUserById, getUserByIdentifier, loginUser, updateBiometricPreference } from "@/services/userService"
import { CreateUserInput } from "@/types/user"
import { router } from "expo-router"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import "react-native-get-random-values"

type UserSettings = {
  notification_enabled: boolean
  days_before_reminder: number
  inactivity_timeout: number
  language: string
  remember_session: boolean
  session_duration: number
}

type User = {
  user_id: string
  full_name: string
  email: string
  phone_number: string
  biometric_enabled: boolean
  settings?: UserSettings
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

        const sessionValid = await isSessionValid()
        const storedAuth = await getAuthToken()

        if (!sessionValid || !storedAuth) {
          await clearAuthToken()
          await clearUserIdentifier()
          set({ user: null, isInitialized: true, loading: false, sessionExpired: !sessionValid && !!storedAuth })
          return
        }

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
              remember_session: settings.remember_session,
              session_duration: settings.session_duration,
            },
          },
          isInitialized: true,
          loading: false,
          sessionExpired: false,
        })
      } catch (error) {
        console.error("Failed to load user:", error)
        await clearAuthToken()
        await clearUserIdentifier()
        set({ user: null, isInitialized: true, loading: false })
      }
    },

    login: async (credentials) => {
      try {
        console.log("🔐 Starting login process...")

        const result = await loginUser(credentials.identifier, credentials.pin)
        console.log("🔐 Login result:", result ? "success" : "failed")

        if (result) {
          // Stocker l'identifiant pour la biométrie future
          await setUserIdentifier(credentials.identifier)
          console.log("✅ User identifier saved for biometric")

          // Gérer la session
          const settings = await ensureUserSettings(result.user_id)
          if (settings.remember_session) {
            await setSessionExpiry()
            console.log("✅ Session expiry set")
          }

          const authData = { user_id: result.user_id }
          await setAuthToken(JSON.stringify(authData))
          console.log("✅ Auth token saved")

          const user: User = {
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
              remember_session: settings.remember_session,
              session_duration: settings.session_duration,
            },
          }

          set({
            user,
            sessionExpired: false,
          })

          // Navigation différée pour éviter les conflits
          setTimeout(() => {
            router.replace("/(tabs)/dashboard")
          }, 100)

          return true
        }

        return false
      } catch (error) {
        console.error("❌ Login error:", error)
        return false
      }
    },

    loginWithBiometric: async () => {
      try {
        console.log("🔐 Starting biometric login process...")

        // Récupérer l'identifiant stocké
        const storedIdentifier = await getUserIdentifier()
        if (!storedIdentifier) {
          Toast.error("No stored credentials found for biometric authentication")
          return false
        }

        // Vérifier que l'utilisateur existe et a la biométrie activée
        const user = await getUserByIdentifier(storedIdentifier)
        if (!user) {
          Toast.error("User not found")
          return false
        }

        if (!user.biometric_enabled) {
          Toast.error("Biometric authentication is not enabled for this account")
          return false
        }

        // Vérifier les capacités biométriques
        const capabilities = await checkBiometricCapabilities()
        if (!capabilities.isAvailable) {
          Toast.error("Biometric authentication is not available")
          return false
        }

        // Authentification biométrique
        const biometricResult = await authenticateWithBiometric()
        if (!biometricResult.success) {
          Toast.error(biometricResult.error || "Biometric authentication failed")
          return false
        }

        // Connexion avec bypass PIN
        const result = await loginUser(storedIdentifier, "", true)
        if (result) {
          const settings = await ensureUserSettings(result.user_id)
          await setSessionExpiry()

          const authData = { user_id: result.user_id }
          await setAuthToken(JSON.stringify(authData))

          const userObj: User = {
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
              remember_session: settings.remember_session,
              session_duration: settings.session_duration,
            },
          }

          set({
            user: userObj,
            sessionExpired: false,
          })

          // Navigation différée
          setTimeout(() => {
            router.replace("/(tabs)/dashboard")
          }, 100)

          return true
        }

        return false
      } catch (error) {
        console.error("❌ Biometric login error:", error)
        Toast.error("Biometric authentication error")
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
        const user_id = await createUser({
          full_name: credentials.full_name,
          email: credentials.email,
          phone_number: credentials.phone_number,
          pin: credentials.pin,
        })

        // Stocker l'identifiant pour futures connexions
        const identifier = credentials.email || credentials.phone_number
        await setUserIdentifier(identifier)

        const settings = await ensureUserSettings(user_id)
        await setSessionExpiry()

        const authData = { user_id }
        await setAuthToken(JSON.stringify(authData))

        const user: User = {
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
            remember_session: settings.remember_session,
            session_duration: settings.session_duration,
          },
        }

        set({ user })

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
          const updatedSettings: UserSettings = settings
            ? {
                notification_enabled: settings.notification_enabled,
                days_before_reminder: settings.days_before_reminder,
                inactivity_timeout: settings.inactivity_timeout,
                language: settings.language,
                remember_session: settings.remember_session,
                session_duration: settings.session_duration,
              }
            : user.settings || {
                notification_enabled: DEFAULT_SETTINGS.notification_enabled,
                days_before_reminder: DEFAULT_SETTINGS.days_before_reminder,
                inactivity_timeout: DEFAULT_SETTINGS.inactivity_timeout,
                language: DEFAULT_SETTINGS.language,
                remember_session: DEFAULT_SETTINGS.remember_session,
                session_duration: DEFAULT_SETTINGS.session_duration,
              }

          set({
            user: {
              ...userData,
              settings: updatedSettings,
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
      // Ne pas supprimer l'identifiant pour permettre la reconnexion rapide
      // await clearUserIdentifier()
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
