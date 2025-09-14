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
