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
