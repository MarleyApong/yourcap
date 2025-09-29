import AsyncStorage from "@react-native-async-storage/async-storage"
import { getSettings } from "@/services/settingsService"

const AUTH_TOKEN_KEY = "auth_token"
const USER_IDENTIFIER_KEY = "user_identifier"
const SESSION_EXPIRY_KEY = "session_expiry"
const APP_LOCK_KEY = "app_locked"

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
    console.log("Auth token saved")
  } catch (error) {
    console.error("Error saving auth token:", error)
    throw error
  }
}

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
    console.log("Auth token cleared")
  } catch (error) {
    console.error("Error clearing auth token:", error)
    throw error
  }
}

export const setUserIdentifier = async (identifier: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_IDENTIFIER_KEY, identifier)
    console.log("User identifier saved:", identifier)
  } catch (error) {
    console.error("Error saving user identifier:", error)
    throw error
  }
}

export const getUserIdentifier = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_IDENTIFIER_KEY)
  } catch (error) {
    console.error("Error getting user identifier:", error)
    return null
  }
}

export const clearUserIdentifier = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_IDENTIFIER_KEY)
    console.log("User identifier cleared")
  } catch (error) {
    console.error("Error clearing user identifier:", error)
    throw error
  }
}

export const setAppLocked = async (locked: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(APP_LOCK_KEY, JSON.stringify({ locked, timestamp: Date.now() }))
    console.log("App lock state set:", locked)
  } catch (error) {
    console.error("Error setting app lock:", error)
  }
}

export const isAppLocked = async (): Promise<boolean> => {
  try {
    const lockData = await AsyncStorage.getItem(APP_LOCK_KEY)
    if (!lockData) return false

    const { locked } = JSON.parse(lockData)
    return locked
  } catch (error) {
    console.error("Error checking app lock:", error)
    return false
  }
}

export const setSessionExpiry = async (): Promise<void> => {
  try {
    const authToken = await getAuthToken()
    if (!authToken) return

    const authData = JSON.parse(authToken)
    const userSettings = await getUserSettings(authData.user_id)

    if (userSettings?.remember_session) {
      const expiryTime = new Date()
      expiryTime.setMinutes(expiryTime.getMinutes() + userSettings.session_duration)
      await AsyncStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toISOString())
      console.log("Session expiry set to:", expiryTime)
    } else {
      await clearSessionExpiry()
    }
  } catch (error) {
    console.error("Error setting session expiry:", error)
  }
}

export const clearSessionExpiry = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_EXPIRY_KEY)
    console.log("Session expiry cleared")
  } catch (error) {
    console.error("Error clearing session expiry:", error)
  }
}

export const isSessionValid = async (): Promise<boolean> => {
  try {
    const expiryStr = await AsyncStorage.getItem(SESSION_EXPIRY_KEY)
    if (!expiryStr) return false

    const expiryTime = new Date(expiryStr)
    const now = new Date()
    const isValid = now < expiryTime

    console.log("Session check - Now:", now, "Expiry:", expiryTime, "Valid:", isValid)
    return isValid
  } catch (error) {
    console.error("Error checking session validity:", error)
    return false
  }
}

// Check if user has previous session data (for quick auth flow)
export const hasPreviousSession = async (): Promise<{ hasData: boolean; identifier?: string; biometricEnabled?: boolean }> => {
  try {
    const identifier = await getUserIdentifier()
    const authToken = await getAuthToken()

    if (!identifier || !authToken) {
      return { hasData: false }
    }

    // Get user settings to check biometric preference
    const authData = JSON.parse(authToken)
    const settings = await getUserSettings(authData.user_id)

    return {
      hasData: true,
      identifier,
      biometricEnabled: settings?.biometric_enabled || false,
    }
  } catch (error) {
    console.error("Error checking previous session:", error)
    return { hasData: false }
  }
}

// Helper function to get user settings
const getUserSettings = async (user_id: string): Promise<any> => {
  try {
    const settings = await getSettings(user_id)
    return (
      settings || {
        remember_session: true,
        session_duration: 1440, // 24 hours default
        biometric_enabled: false,
      }
    )
  } catch (error) {
    console.error("Error getting user settings:", error)
    return null
  }
}

// Nouvelle fonction pour vérifier si l'utilisateur a une session valide pour l'authentification rapide
export const hasValidSessionForQuickAuth = async (): Promise<{ hasValidSession: boolean; identifier?: string; biometricEnabled?: boolean }> => {
  try {
    const sessionValid = await isSessionValid()
    const previousSession = await hasPreviousSession()

    // Session valide = l'utilisateur n'a pas besoin de ressaisir l'identifiant
    // Mais doit quand même confirmer avec PIN/fingerprint
    const hasValidSession = sessionValid && previousSession.hasData

    console.log("Quick auth check - Session valid:", sessionValid, "Previous session:", previousSession.hasData, "Result:", hasValidSession)

    return {
      hasValidSession,
      identifier: previousSession.identifier,
      biometricEnabled: previousSession.biometricEnabled,
    }
  } catch (error) {
    console.error("Error checking valid session for quick auth:", error)
    return { hasValidSession: false }
  }
}
