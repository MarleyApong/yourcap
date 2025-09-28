import AsyncStorage from "@react-native-async-storage/async-storage"

const AUTH_TOKEN_KEY = "auth_token"
const USER_IDENTIFIER_KEY = "user_identifier"
const SESSION_EXPIRY_KEY = "session_expiry"

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
    console.log("✅ Auth token saved")
  } catch (error) {
    console.error("❌ Error saving auth token:", error)
    throw error
  }
}

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("❌ Error getting auth token:", error)
    return null
  }
}

export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
    console.log("✅ Auth token cleared")
  } catch (error) {
    console.error("❌ Error clearing auth token:", error)
    throw error
  }
}

export const setUserIdentifier = async (identifier: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_IDENTIFIER_KEY, identifier)
    console.log("✅ User identifier saved:", identifier)
  } catch (error) {
    console.error("❌ Error saving user identifier:", error)
    throw error
  }
}

export const getUserIdentifier = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_IDENTIFIER_KEY)
  } catch (error) {
    console.error("❌ Error getting user identifier:", error)
    return null
  }
}

export const clearUserIdentifier = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_IDENTIFIER_KEY)
    console.log("✅ User identifier cleared")
  } catch (error) {
    console.error("❌ Error clearing user identifier:", error)
    throw error
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
      console.log("✅ Session expiry set to:", expiryTime)
    } else {
      await clearSessionExpiry()
    }
  } catch (error) {
    console.error("❌ Error setting session expiry:", error)
  }
}

export const clearSessionExpiry = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_EXPIRY_KEY)
    console.log("✅ Session expiry cleared")
  } catch (error) {
    console.error("❌ Error clearing session expiry:", error)
  }
}

export const isSessionValid = async (): Promise<boolean> => {
  try {
    const expiryStr = await AsyncStorage.getItem(SESSION_EXPIRY_KEY)
    if (!expiryStr) return false

    const expiryTime = new Date(expiryStr)
    const now = new Date()
    const isValid = now < expiryTime

    console.log("🔍 Session check - Now:", now, "Expiry:", expiryTime, "Valid:", isValid)
    return isValid
  } catch (error) {
    console.error("❌ Error checking session validity:", error)
    return false
  }
}

// Helper function to get user settings
const getUserSettings = async (user_id: string): Promise<any> => {
  try {
    // Implémentez cette fonction selon votre structure de données
    // Pour l'instant, retournons des valeurs par défaut
    return {
      remember_session: true,
      session_duration: 1440, // 24 heures par défaut
    }
  } catch (error) {
    console.error("❌ Error getting user settings:", error)
    return null
  }
}
