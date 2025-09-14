import * as SecureStore from "expo-secure-store"

const AUTH_TOKEN_KEY = "auth_token"

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token)
  } catch (error) {
    console.error("Error setting auth token:", error)
  }
}

export const clearAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error("Error clearing auth token:", error)
  }
}

export const setUserIdentifier = async (identifier: string): Promise<void> => {
  await SecureStore.setItemAsync("user_identifier", identifier)
}

export const getUserIdentifier = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("user_identifier")
}

export const clearUserIdentifier = async (): Promise<void> => {
  await SecureStore.deleteItemAsync("user_identifier")
}

const SESSION_EXPIRY_KEY = "session_expiry"

export const getSessionExpiry = async (): Promise<number | null> => {
  try {
    const expiry = await SecureStore.getItemAsync(SESSION_EXPIRY_KEY)
    return expiry ? parseInt(expiry) : null
  } catch (error) {
    console.error("Error getting session expiry:", error)
    return null
  }
}

export const clearSessionExpiry = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SESSION_EXPIRY_KEY)
  } catch (error) {
    console.error("Error clearing session expiry:", error)
  }
}

const REMEMBER_SESSION_KEY = "remember_session"
const SESSION_DURATION_KEY = "session_duration"

export const setRememberSession = async (enabled: boolean, duration: number = 1440): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REMEMBER_SESSION_KEY, enabled ? "true" : "false")
    await SecureStore.setItemAsync(SESSION_DURATION_KEY, duration.toString())
  } catch (error) {
    console.error("Error setting remember session:", error)
  }
}

export const getRememberSession = async (): Promise<{ enabled: boolean; duration: number }> => {
  try {
    const enabled = await SecureStore.getItemAsync(REMEMBER_SESSION_KEY)
    const duration = await SecureStore.getItemAsync(SESSION_DURATION_KEY)
    
    return {
      enabled: enabled === "true",
      duration: duration ? parseInt(duration) : 1440
    }
  } catch (error) {
    console.error("Error getting remember session:", error)
    return { enabled: true, duration: 1440 }
  }
}

export const setSessionExpiry = async (): Promise<void> => {
  try {
    const { enabled, duration } = await getRememberSession()
    
    if (enabled) {
      const expiryTime = new Date().getTime() + duration * 60 * 1000
      await SecureStore.setItemAsync("session_expiry", expiryTime.toString())
    } else {
      // Si "remember session" est désactivé, on ne sauvegarde pas l'expiration
      await SecureStore.deleteItemAsync("session_expiry")
    }
  } catch (error) {
    console.error("Error setting session expiry:", error)
  }
}

export const isSessionValid = async (): Promise<boolean> => {
  try {
    const { enabled } = await getRememberSession()
    if (!enabled) return false // Si "remember session" est désactivé, la session n'est jamais valide
    
    const expiry = await SecureStore.getItemAsync("session_expiry")
    if (!expiry) return false
    
    return new Date().getTime() < parseInt(expiry)
  } catch (error) {
    console.error("Error checking session validity:", error)
    return false
  }
}